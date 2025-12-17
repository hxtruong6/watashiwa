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
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
	title: 'WatashiWa - Học Tiếng Nhật SRS Cực Cuốn',
	description:
		'Người bạn đồng hành học tiếng Nhật với SRS. Không áp lực, nhớ lâu, học theo cách của bạn. Hai hệ máy, miễn phí & mã nguồn mở.',
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
		title: 'WatashiWa - Học Tiếng Nhật SRS Cực Cuốn (Gen Z Support)',
		description:
			'Người bạn đồng hành học tiếng Nhật với SRS. Không áp lực, nhớ lâu, học theo cách của bạn. Hai hệ máy, miễn phí & mã nguồn mở.',
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
		title: 'WatashiWa - Học Tiếng Nhật SRS Cực Cuốn (Gen Z Support)',
		description:
			'Người bạn đồng hành học tiếng Nhật với SRS. Không áp lực, nhớ lâu, học theo cách của bạn. Chiến ngay đi ní!',
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
		<html lang={locale} suppressHydrationWarning>
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
