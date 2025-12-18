import { prisma } from '@/lib/db';
import { NotificationService } from '@/services/NotificationService';
import { getUser } from '@/services/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { subscription, userAgent } = body;

		if (!subscription || !subscription.endpoint) {
			return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
		}

		await NotificationService.subscribe(user.id, subscription, userAgent);

		// --- Send Welcome Notification ---
		// Fetch user's language preference
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { language: true },
		});
		const lang = dbUser?.language || 'en';

		const messages = {
			en: {
				title: 'Welcome to WatashiWa! 🎉',
				body: 'You will now receive reminders to keep your streak.',
			},
			vi: {
				title: 'Chào mừng đến với WatashiWa! 🎉',
				body: 'Giờ đây bạn sẽ nhận được nhắc nhở để giữ chuỗi học tập.',
			},
		};

		const msg = (messages as any)[lang] || messages.en;

		// Fire and forget (don't await) to keep response fast
		NotificationService.sendToUser(user.id, {
			title: msg.title,
			body: msg.body,
			url: '/', // Open app on click
			tag: 'welcome',
		}).catch((err) => console.error('Error sending welcome notification:', err));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error saving subscription:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
