import { inngest } from '@/inngest/client';
import { sendOTPEmail } from '@/inngest/functions/send-otp-email';
import { sendWelcomeEmail } from '@/inngest/functions/send-welcome-email';
import { serve } from 'inngest/next';

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [sendWelcomeEmail, sendOTPEmail],
});
