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

export async function generateMetadata(): Promise<Metadata> {
	// Use default locale statically - no dynamic data access during prerendering
	const locale = routing.defaultLocale as 'vi' | 'en';

	const metadata = generatePageMetadata({
		locale,
		url: '/',
	});

	// Add Google Search Console verification if available
	const verification = process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION;
	if (verification) {
		metadata.verification = {
			google: verification,
		};
	}

	// Add icons and PWA metadata
	return {
		...metadata,
		icons: {
			icon: '/assets/w_logo.png',
			shortcut: '/assets/w_logo.png',
			apple: '/assets/w_logo.png',
		},
		appleWebApp: {
			capable: true,
			title: 'WatashiWa',
			statusBarStyle: 'black-translucent',
		},
		manifest: '/manifest.json',
	};
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
};

// Component that fetches user - wrapped in Suspense for cacheComponents
async function NavBarWithUser() {
	let user = null;
	try {
		const { getUser } = await import('@/modules/auth/auth.actions');
		user = await getUser();
	} catch {
		// During prerendering, cookies() rejects. NavBar handles null users gracefully.
	}
	return <NavBar user={user} />;
}

// Component that fetches locale and messages - wrapped in Suspense for cacheComponents
async function IntlProviderWithData({ children }: { children: React.ReactNode }) {
	await connection(); // Wait for user request - getMessages() may access cookies()
	// getMessages() may access cookies() during prerendering, so we handle errors gracefully
	let messages;
	try {
		messages = await getMessages();
	} catch {
		// During prerendering, getMessages() may fail if it accesses cookies()
		// Fall back to default messages which are already loaded in the root layout
		const defaultLocale = routing.defaultLocale;
		messages = (await import(`@/i18n/messages/${defaultLocale}.json`)).default;
	}

	return (
		<NextIntlClientProvider messages={messages}>
			<AntdRegistry>
				<ThemeProvider>
					<Suspense fallback={<NavBar user={null} />}>
						<NavBarWithUser />
					</Suspense>
					<main className="app-main">{children}</main>
					<PWAInstallPrompt />
					<PWALifecycle />
				</ThemeProvider>
			</AntdRegistry>
		</NextIntlClientProvider>
	);
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Use default locale for html lang attribute during prerendering
	const defaultLocale = routing.defaultLocale;
	// Load default messages for fallback
	const defaultMessages = (await import(`@/i18n/messages/${defaultLocale}.json`)).default;
	console.log('defaultMessages', defaultMessages);

	return (
		<html lang={defaultLocale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<StructuredData />
				<DisableZoom />
				<PostHogPageTracker />
				<UserReturnTracker />
				<NuqsAdapter>
					{/* <NextIntlClientProvider messages={defaultMessages}> */}
					{/* <AntdRegistry> */}
					{/* <ThemeProvider> */}
					{/* <Suspense fallback={<NavBar user={null} />}>
					<NavBarWithUser />
				</Suspense> */}
					<Suspense
						fallback={
							<main className="app-main">
								{/* Loading state - children will render once IntlProviderWithData resolves */}
								Hello World
							</main>
						}
					>
						<IntlProviderWithData>{children}</IntlProviderWithData>
					</Suspense>
					{/* <PWAInstallPrompt /> */}
					<PWALifecycle />
					{/* </ThemeProvider> */}
					{/* </AntdRegistry> */}
					{/* </NextIntlClientProvider> */}
				</NuqsAdapter>
			</body>
		</html>
	);
}
