import PostHogPageTracker from '@/components/Analytics/PostHogPageTracker';
import UserReturnTracker from '@/components/Analytics/UserReturnTracker';
import DisableZoom from '@/components/DisableZoom';
import PWAInstallPrompt from '@/components/PWA/PWAInstallPrompt';
import PWALifecycle from '@/components/PWA/PWALifecycle';
import { StructuredData } from '@/components/SEO/StructuredData';
import ThemeProvider from '@/components/theme/ThemeProvider';
import { routing } from '@/i18n/routing';
import { generatePageMetadata } from '@/lib/seo/metadata';
import NavBar from '@/modules/ui/components/NavBar';
import NavBarSkeleton from '@/modules/ui/components/navbar/NavBarSkeleton';
import { LayoutSkeleton } from '@/modules/ui/components/skeletons';
import '@/styles/_accessibility.css';
import '@/styles/_animations.css';
import '@/styles/_reset.css';
import '@/styles/_third-party.css';
import '@/styles/_utilities.css';
// Import style partials in order (ITCSS: Settings → Tools → Generic → Elements → Objects → Components)
// Order matters for CSS cascade - do not auto-sort these imports
// prettier-ignore
import '@/styles/_variables.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { connection } from 'next/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const locale = routing.defaultLocale as 'vi' | 'en';

const baseMetadata = generatePageMetadata({
	locale,
	url: '/',
});

export const metadata: Metadata = {
	...baseMetadata,
	...(process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION && {
		verification: {
			google: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION,
		},
	}),
	appleWebApp: {
		capable: true,
		title: 'WatashiWa',
		statusBarStyle: 'black-translucent',
	},
	manifest: '/manifest.json',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
};

/**
 * Providers wrapper that fetches dynamic data (messages, user)
 * This component is wrapped in Suspense to enable Partial Prerendering (PPR)
 * Static shell renders immediately, dynamic parts stream in
 */
async function AppProviders({ children }: { children: React.ReactNode }) {
	await connection(); // Wait for request context before accessing cookies/headers

	let messages;
	try {
		messages = await getMessages();
	} catch {
		// During prerendering, getMessages() may fail if it accesses cookies()
		// Fall back to default messages
		const defaultLocale = routing.defaultLocale;
		messages = (await import(`@/i18n/messages/${defaultLocale}.json`)).default;
	}

	return (
		<NextIntlClientProvider messages={messages}>
			<AntdRegistry>
				<ThemeProvider>
					<Suspense fallback={<NavBarSkeleton />}>
						<NavBar />
					</Suspense>
					<main className="app-main">{children}</main>
					<PWAInstallPrompt />
					<PWALifecycle />
				</ThemeProvider>
			</AntdRegistry>
		</NextIntlClientProvider>
	);
}

/**
 * Root Layout - Optimized for Next.js 16 cacheComponents (PPR)
 *
 * Structure:
 * - Static parts (HTML, fonts, analytics) render immediately for PPR
 * - Dynamic providers (Intl, Auth) wrapped in Suspense to stream in
 * - Proper provider nesting: NuqsAdapter > NextIntlClientProvider > AntdRegistry > ThemeProvider
 *
 * Benefits:
 * - Fast initial page load (static shell)
 * - SEO-friendly (static HTML sent immediately)
 * - Progressive enhancement (dynamic parts stream in)
 */
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const defaultLocale = routing.defaultLocale;

	return (
		<html lang={defaultLocale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				{/* Static components - render immediately for PPR */}
				<StructuredData />
				<DisableZoom />
				<PostHogPageTracker />
				<UserReturnTracker />

				<NuqsAdapter>
					{/* Dynamic providers - stream in via Suspense for PPR */}
					<Suspense fallback={<LayoutSkeleton />}>
						<AppProviders>{children}</AppProviders>
					</Suspense>
				</NuqsAdapter>
			</body>
		</html>
	);
}
