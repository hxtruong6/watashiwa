import { inngest } from '@/inngest/client';
import { sendEmail } from '@/modules/email/email.service';
import { renderTemplateFromFile } from '@/modules/email/utils/template-loader';

/**
 * Inngest function to send welcome email
 * Triggered by: user/registered event
 */
export const sendWelcomeEmail = inngest.createFunction(
	{
		id: 'send-welcome-email',
		name: 'Send Welcome Email',
		retries: 3,
	},
	{ event: 'user/registered' },
	async ({ event, step }) => {
		const { userEmail, userName, userId, language } = event.data;

		// Render email templates from file
		const templates = await step.run('render-templates', async () => {
			return renderTemplateFromFile(
				'welcome',
				{
					userName: userName || userEmail.split('@')[0],
					userEmail,
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
			throw new Error(`Failed to send welcome email: ${result.error}`);
		}

		return { success: true, userEmail, userId };
	},
);
