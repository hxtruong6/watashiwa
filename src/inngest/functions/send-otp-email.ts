import { inngest } from '@/inngest/client';
import { sendEmail } from '@/modules/email/email.service';
import { renderTemplateFromFile } from '@/modules/email/utils/template-loader';

/**
 * Inngest function to send OTP verification email
 * Triggered by: user/otp.requested event
 */
export const sendOTPEmail = inngest.createFunction(
	{
		id: 'send-otp-email',
		name: 'Send OTP Verification Email',
		retries: 3,
	},
	{ event: 'user/otp.requested' },
	async ({ event, step }) => {
		const { userEmail, userName, otp, language } = event.data;

		// Render email templates from file
		const templates = await step.run('render-templates', async () => {
			return renderTemplateFromFile(
				'otp-verification',
				{
					userName: userName || userEmail.split('@')[0],
					userEmail,
					otp,
				},
				language || 'en',
			);
		});

		// Send email
		const result = await step.run('send-email', async () => {
			return await sendEmail({
				to: userEmail,
				subject: templates.subject,
				html: templates.html,
				text: templates.text,
			});
		});

		if (!result.success) {
			throw new Error(`Failed to send OTP email: ${result.error}`);
		}

		return { success: true, userEmail, otpSent: true };
	},
);
