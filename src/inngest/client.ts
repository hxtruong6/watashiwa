import { Inngest } from 'inngest';

// Create a client to send and receive events
// For self-hosted Inngest, set INNGEST_DEV to your server URL (e.g., http://localhost:8288)
// The SDK will automatically use this URL for both API and event ingestion
export const inngest = new Inngest({
	id: process.env.INNGEST_APP_ID || 'watashiwa-app',
	// If INNGEST_DEV is set to a valid URL, SDK uses it automatically
	// For production self-hosted, set: INNGEST_DEV=http://your-server:8288
	// For Inngest Cloud, leave INNGEST_DEV unset
});
