import * as Sentry from '@sentry/nextjs';

export async function register() {
	// Check if we should enable analytics
	// Default: false in development, true in production, unless overridden by env var
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || !isDevelopment;

	if (!isEnabled) {
		return;
	}

	// Initialize Sentry for server-side (Node.js runtime)
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

			// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
			// Reduced from 1.0 to 0.1 to prevent rate limiting (429 errors)
			tracesSampleRate: isDevelopment ? 0.1 : 0.1,

			// Enable logs to be sent to Sentry
			enableLogs: true,

			// Setting this option to true will print useful information to the console while you're setting up Sentry.
			// Disable to reduce console noise - set to true only when debugging Sentry issues
			debug: false,
		});
	}

	// Initialize Sentry for edge runtime
	if (process.env.NEXT_RUNTIME === 'edge') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

			// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
			// Reduced from 1.0 to 0.1 to prevent rate limiting (429 errors)
			tracesSampleRate: isDevelopment ? 0.1 : 0.1,

			// Enable logs to be sent to Sentry
			enableLogs: true,

			// Setting this option to true will print useful information to the console while you're setting up Sentry.
			// Disable to reduce console noise - set to true only when debugging Sentry issues
			debug: false,
		});
	}
}

// Capture errors from Server Components, middleware, and proxies
export const onRequestError = Sentry.captureRequestError;
