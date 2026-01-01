/**
 * Email Service - Mailtrap Integration
 */
import { MailtrapClient } from 'mailtrap';

import { EmailOptions } from './email.types';

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN;
const MAILTRAP_FROM_EMAIL = process.env.MAILTRAP_FROM_EMAIL || 'info@watashiwa.app';
const MAILTRAP_FROM_NAME = process.env.MAILTRAP_FROM_NAME || 'WatashiWa';

const mailtrapClient = MAILTRAP_API_TOKEN
	? new MailtrapClient({ token: MAILTRAP_API_TOKEN })
	: null;

/**
 * Send email via Mailtrap SDK
 * Uses official Mailtrap package for full feature support
 */
export async function sendEmail(
	options: EmailOptions,
): Promise<{ success: boolean; error?: string }> {
	if (!mailtrapClient) {
		console.error('MAILTRAP_API_TOKEN is not configured');
		return { success: false, error: 'Email service not configured' };
	}

	try {
		const response = await mailtrapClient.send({
			from: {
				email: options.from || MAILTRAP_FROM_EMAIL,
				name: options.fromName || MAILTRAP_FROM_NAME,
			},
			to: [
				{
					email: options.to,
				},
			],
			subject: options.subject,
			html: options.html,
			text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
		});

		// Mailtrap SDK returns response with success and message_ids
		if (response.success) {
			console.log('Email sent successfully:', response.message_ids);
			return { success: true };
		}

		return {
			success: false,
			error: 'Failed to send email via Mailtrap',
		};
	} catch (error) {
		console.error('Error sending email:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}
