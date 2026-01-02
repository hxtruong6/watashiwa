import PostHogPageTracker from '@/components/Analytics/PostHogPageTracker';
import UserReturnTracker from '@/components/Analytics/UserReturnTracker';
import DisableZoom from '@/components/DisableZoom';
import PWAInstallPrompt from '@/components/PWA/PWAInstallPrompt';
import PWALifecycle from '@/components/PWA/PWALifecycle';
import { StructuredData } from '@/components/SEO/StructuredData';
import ThemeProvider from '@/components/theme/ThemeProvider';
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
import { getLocale, getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
	const locale = (await getLocale()) as 'vi' | 'en';

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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();

	// Fetch user for NavBar state
	const { getUser } = await import('@/modules/auth/auth.actions');
	const user = await getUser();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<StructuredData />
				<DisableZoom />
				<PostHogPageTracker />
				<UserReturnTracker />
				<NuqsAdapter>
					<NextIntlClientProvider messages={messages}>
						<AntdRegistry>
							<ThemeProvider>
								<NavBar user={user} />
								<main className="app-main">{children}</main>
								<PWAInstallPrompt />
								<PWALifecycle />
							</ThemeProvider>
						</AntdRegistry>
					</NextIntlClientProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
