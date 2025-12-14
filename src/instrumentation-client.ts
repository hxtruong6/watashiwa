import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';
import themeConfig from '@/lib/theme/themeConfig';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Check if we should enable analytics
// Default: false in development, true in production, unless overridden by env var
const isDevelopment = process.env.NODE_ENV === 'development';
const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || !isDevelopment;

if (isEnabled) {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

		// Add optional integrations for additional features
		integrations: [
			Sentry.replayIntegration({
				// Additional Replay configuration goes here
				maskAllText: true,
				blockAllMedia: true,
			}),
			Sentry.feedbackIntegration({
				colorScheme: 'system',
				autoInject: false,
				themeLight: {
					submitBackground: themeConfig.token?.colorPrimary || '#1E3A5F',
					submitForeground: '#FFFFFF',
					accentBackground: themeConfig.token?.colorPrimary || '#1E3A5F',
					background: '#FFFFFF',
				},
			}),
			// send console.log, console.warn, and console.error calls as logs to Sentry
			Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
		],
		// Enable logs to be sent to Sentry
		enableLogs: true,

		// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
		tracesSampleRate: 1,

		// Define how likely Replay events are sampled.
		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.1,

		// Define how likely Replay events are sampled when an error occurs.
		replaysOnErrorSampleRate: 1.0,

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: true,

		// Tunnel traffic through Next.js rewrite to bypass AdBlockers
		tunnel: '/monitoring',
	});

	if (typeof window !== 'undefined') {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host: '/ingest',
			ui_host: 'https://us.posthog.com',
			// person_profiles: 'identified_only',
			capture_pageview: false, // We handle this manually in PostHogPageTracker
		});
	}
}
