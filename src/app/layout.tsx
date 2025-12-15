import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ThemeProvider from '@/components/theme/ThemeProvider';
import NavBar from '@/components/NavBar';
import PostHogPageTracker from '@/components/Analytics/PostHogPageTracker';
import DisableZoom from '@/components/DisableZoom';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'WatashiWa - Học Cực Cuốn - Cực Hay!',
	description:
		'App học từ vựng SRS xịn sò, không lo rớt môn. Flex trình độ N1, cày Kanji siêu dính. Chiến ngay đi ní!',
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
	openGraph: {
		title: 'WatashiWa - Học Cực Cuốn - Cực Hay!',
		description:
			'App học từ vựng SRS xịn sò, không lo rớt môn. Flex trình độ N1, cày Kanji siêu dính. Chiến ngay đi ní!',
		url: 'https://watashiwa.app', // Replace with actual URL if known, or generic
		siteName: 'WatashiWa',
		images: [
			{
				url: '/assets/w_logo.png', // Fallback to logo
				width: 512,
				height: 512,
				alt: 'WatashiWa Logo',
			},
		],
		locale: 'vi_VN',
		type: 'website',
	},
	twitter: {
		card: 'summary', // 'summary_large_image' usually requires a 2:1 landscape image. 'summary' is better for square logo.
		title: 'WatashiWa - Học Cực Cuốn - Cực Hay!',
		description:
			'App học từ vựng xịn sò, không lo rớt môn. Flex trình độ N1, cày Kanji siêu dính. Chiến ngay đi ní!',
		images: ['/assets/w_logo.png'],
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
};

import { getLocale, getMessages } from 'next-intl/server';
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
		<html lang={locale}>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<DisableZoom />
				<PostHogPageTracker />
				<NextIntlClientProvider messages={messages}>
					<AntdRegistry>
						<ThemeProvider>
							<NavBar user={user} />
							<main className="app-main">{children}</main>
						</ThemeProvider>
					</AntdRegistry>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
