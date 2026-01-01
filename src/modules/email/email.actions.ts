'use server';

import { inngest } from '@/inngest/client';
import { prisma } from '@/lib/db';
import { executeSafeAction } from '@/modules/core/action-client';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

import { generateOTP, hashOTP, isOTPExpired, verifyOTP } from './utils/otp-generator';

const VerifyOTPSchema = z.object({
	otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
	userId: z.string().uuid().optional(), // Optional - will get from session if not provided
});

/**
 * Request email verification OTP
 * Generates OTP, stores it in database, and sends email via Inngest
 */
export async function requestEmailVerification() {
	return executeSafeAction(
		z.object({ success: z.boolean(), message: z.string() }),
		undefined,
		async () => {
			const supabase = await createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('Not authenticated');
			}

			// Get user from database
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					email: true,
					name: true,
					emailVerifiedAt: true,
					emailVerificationOTPExpires: true,
					language: true,
				},
			});

			if (!dbUser) {
				throw new Error('User not found');
			}

			if (dbUser.emailVerifiedAt) {
				return { success: true, message: 'Email is already verified' };
			}

			// Rate limiting: Check if OTP was requested recently (within last hour)
			const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
			if (dbUser.emailVerificationOTPExpires && dbUser.emailVerificationOTPExpires > oneHourAgo) {
				const minutesLeft = Math.ceil(
					(dbUser.emailVerificationOTPExpires.getTime() - oneHourAgo.getTime()) / 60000,
				);
				throw new Error(`Please wait ${minutesLeft} minutes before requesting a new OTP code`);
			}

			// Generate OTP
			const otp = generateOTP();
			const hashedOTP = await hashOTP(otp);
			const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

			// Store OTP in database
			await prisma.user.update({
				where: { id: dbUser.id },
				data: {
					emailVerificationOTP: hashedOTP,
					emailVerificationOTPExpires: expiresAt,
				},
			});

			// Trigger Inngest event to send OTP email
			await inngest.send({
				name: 'user/otp.requested',
				data: {
					userEmail: dbUser.email,
					userName: dbUser.name || dbUser.email.split('@')[0],
					userId: dbUser.id,
					otp, // Send plain OTP to Inngest function (it will be in the email)
					language: dbUser.language || 'en',
				},
			});

			return {
				success: true,
				message: 'Verification code sent to your email. Please check your inbox.',
			};
		},
	);
}

/**
 * Verify email with OTP code
 */
export async function verifyEmailOTP(data: z.infer<typeof VerifyOTPSchema>) {
	return executeSafeAction(VerifyOTPSchema, data, async (validated) => {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Not authenticated');
		}

		const userId = validated.userId || user.id;

		// Get user from database
		const dbUser = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				emailVerifiedAt: true,
				emailVerificationOTP: true,
				emailVerificationOTPExpires: true,
			},
		});

		if (!dbUser) {
			throw new Error('User not found');
		}

		if (dbUser.emailVerifiedAt) {
			return { success: true, message: 'Email is already verified' };
		}

		if (!dbUser.emailVerificationOTP || !dbUser.emailVerificationOTPExpires) {
			throw new Error('No verification code found. Please request a new code.');
		}

		// Check if OTP is expired
		if (isOTPExpired(dbUser.emailVerificationOTPExpires)) {
			// Clear expired OTP
			await prisma.user.update({
				where: { id: dbUser.id },
				data: {
					emailVerificationOTP: null,
					emailVerificationOTPExpires: null,
				},
			});
			throw new Error('Verification code has expired. Please request a new code.');
		}

		// Verify OTP
		const isValid = await verifyOTP(validated.otp, dbUser.emailVerificationOTP);
		if (!isValid) {
			throw new Error('Invalid verification code. Please try again.');
		}

		// Mark email as verified and clear OTP
		await prisma.user.update({
			where: { id: dbUser.id },
			data: {
				emailVerifiedAt: new Date(),
				emailVerificationOTP: null,
				emailVerificationOTPExpires: null,
			},
		});

		return {
			success: true,
			message: 'Email verified successfully!',
		};
	});
}

/**
 * Get email verification status
 */
export async function getEmailVerificationStatus() {
	return executeSafeAction(
		z.object({
			emailVerifiedAt: z.date().nullable(),
			email: z.string(),
		}),
		undefined,
		async () => {
			const supabase = await createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error('Not authenticated');
			}

			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: {
					email: true,
					emailVerifiedAt: true,
				},
			});

			if (!dbUser) {
				throw new Error('User not found');
			}

			return {
				emailVerifiedAt: dbUser.emailVerifiedAt,
				email: dbUser.email,
			};
		},
	);
}
