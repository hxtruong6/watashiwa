import themeConfig from '@/lib/theme/themeConfig';
import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

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
		// Reduced from 1.0 to 0.1 to prevent rate limiting (429 errors)
		tracesSampleRate: isDevelopment ? 0.1 : 0.1,

		// Define how likely Replay events are sampled.
		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.1,

		// Define how likely Replay events are sampled when an error occurs.
		// Reduced from 1.0 to 0.5 to prevent rate limiting while still capturing errors
		replaysOnErrorSampleRate: isDevelopment ? 0.5 : 0.5,

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		// Disable to reduce console noise - set to true only when debugging Sentry issues
		debug: false,

		// Tunnel traffic through Next.js rewrite to bypass AdBlockers
		tunnel: '/monitoring',
	});

	if (typeof window !== 'undefined') {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host: '/ingest',
			ui_host: 'https://us.posthog.com',
			// person_profiles: 'identified_only',
			capture_pageview: true, // We handle this manually in PostHogPageTracker
			// Use latest defaults for SPA support and improved autocapture
			defaults: '2025-11-30',
			// Autocapture configuration
			autocapture: true,
			// Verify PostHog is loaded
			loaded: (posthog) => {
				if (process.env.NODE_ENV === 'development') {
					console.log('[Analytics] PostHog initialized successfully', posthog);
				}
			},
		});
	}
}
