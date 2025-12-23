import { prisma } from '@/lib/db';
import webPush from 'web-push';

// Ensure VAPID keys are set (Fail fast if missing in production)
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
	console.warn('⚠️ VAPID keys are missing! Push notifications will not work.');
} else {
	webPush.setVapidDetails(
		process.env.VAPID_SUBJECT || 'mailto:admin@watashiwa.app',
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY,
	);
}

export interface PushPayload {
	title: string;
	body: string;
	url?: string;
	icon?: string;
	tag?: string; // For grouping (e.g., "streak-reminder")
}

export class NotificationService {
	/**
	 * Send a notification to a specific user across all their devices.
	 * Automatically cleans up invalid (410 Gone) subscriptions.
	 */
	static async sendToUser(userId: string, payload: PushPayload) {
		try {
			// 1. Fetch all subscriptions for this user
			const subscriptions = await prisma.pushSubscription.findMany({
				where: { userId },
			});

			if (subscriptions.length === 0) {
				return { success: true, sentCount: 0, message: 'No subscriptions found' };
			}

			const payloadWithIcon = {
				icon: '/assets/icons/bell-ring.svg',
				...payload,
			};

			const payloadString = JSON.stringify(payloadWithIcon);

			// 2. Send in parallel to all devices
			const results = await Promise.allSettled(
				subscriptions.map(async (sub) => {
					try {
						await webPush.sendNotification(
							{
								endpoint: sub.endpoint,
								keys: {
									p256dh: sub.p256dh,
									auth: sub.auth,
								},
							},
							payloadString,
						);
						return { status: 'fulfilled', subId: sub.id };
					} catch (error: any) {
						// 3. Identification: Is this subscription dead?
						if (error.statusCode === 410 || error.statusCode === 404) {
							return { status: 'rejected', subId: sub.id, reason: 'gone' };
						}
						throw error;
					}
				}),
			);

			// 4. Cleanup Logic (The "Self-Healing" part)
			const goneSubscriptionIds = results
				.filter(
					(r): r is PromiseRejectedResult & { subId?: string } =>
						(r.status === 'rejected' && (r as any).reason === 'gone') ||
						((r as any).subId && (r as any).reason === 'gone'),
				)
				// Clean up the mapping logic above to be safer if needed, but for now filtering by reason is key
				.map((r: any) => r.subId)
				.filter(Boolean);

			if (goneSubscriptionIds.length > 0) {
				console.log(
					`🧹 Cleaning up ${goneSubscriptionIds.length} dead subscriptions for user ${userId}`,
				);
				await prisma.pushSubscription.deleteMany({
					where: { id: { in: goneSubscriptionIds } },
				});
			}

			const sentCount = results.filter((r) => r.status === 'fulfilled').length;
			return { success: true, sentCount };
		} catch (error) {
			console.error('🔥 Error sending push notification:', error);
			return { success: false, error };
		}
	}

	/**
	 * Save a new subscription for a user.
	 * Idempotent: Updates if endpoint exists.
	 */
	static async subscribe(
		userId: string,
		subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
		userAgent?: string,
	) {
		return prisma.pushSubscription.upsert({
			where: { endpoint: subscription.endpoint },
			update: {
				userId,
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userAgent,
				updatedAt: new Date(),
			},
			create: {
				userId,
				endpoint: subscription.endpoint,
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userAgent,
			},
		});
	}
}
