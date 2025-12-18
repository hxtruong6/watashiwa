import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ThemeProvider from '@/components/theme/ThemeProvider';
import NavBar from '@/components/NavBar';
import PostHogPageTracker from '@/components/Analytics/PostHogPageTracker';
import DisableZoom from '@/components/DisableZoom';
import PWAInstallPrompt from '@/components/PWA/PWAInstallPrompt';
import PWALifecycle from '@/components/PWA/PWALifecycle';
import './globals.css';
import { getLocale, getMessages } from 'next-intl/server';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();

	// Vietnamese Metadata (Default)
	const metaVi = {
		title: 'WatashiWa: Học hết khoai, nhớ cực dai',
		description:
			'Người bạn đồng hành học tiếng Nhật với SRS. Không áp lực, nhớ lâu, học theo cách của bạn. Hai hệ máy, miễn phí & mã nguồn mở.',
		keywords: [
			'học tiếng nhật',
			'srs',
			'hán việt',
			'kanji',
			'jlpt',
			'minna no nihongo',
			'từ vựng tiếng nhật',
		],
	};

	// English Metadata
	const metaEn = {
		title: 'WatashiWa: Learn Smart, Not Hard',
		description:
			'Your Japanese learning buddy. Master vocab with SRS, zero pressure. Open source & free forever.',
		keywords: [
			'learn japanese',
			'srs',
			'kanji',
			'spaced repetition',
			'jlpt',
			'han viet',
			'vocabulary',
		],
	};

	const meta = locale === 'vi' ? metaVi : metaEn;

	return {
		metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
		title: meta.title,
		description: meta.description,
		keywords: meta.keywords,
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
		openGraph: {
			title: meta.title,
			description: meta.description,
			url: 'https://watashiwa.app',
			siteName: 'WatashiWa',
			images: [
				{
					url: '/assets/w_logo.png',
					width: 512,
					height: 512,
					alt: 'WatashiWa Logo',
				},
			],
			locale: locale === 'vi' ? 'vi_VN' : 'en_US',
			type: 'website',
		},
		twitter: {
			card: 'summary',
			title: meta.title,
			description: meta.description,
			images: ['/assets/w_logo.png'],
		},
	};
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
};

import { NextIntlClientProvider } from 'next-intl';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();

	// Fetch user for NavBar state
	const { getUser } = await import('@/services/actions');
	const user = await getUser();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<DisableZoom />
				<PostHogPageTracker />
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
			</body>
		</html>
	);
}
