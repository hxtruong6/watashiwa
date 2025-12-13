import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import theme from '../lib/theme/themeConfig';
import NavBar from '@/components/NavBar';
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
	title: 'WatashiWa - Mastery SRS',
	description: 'Learn Japanese with Spaced Repetition',
	icons: {
		icon: '/assets/w_logo.png',
		shortcut: '/assets/w_logo.png',
		apple: '/assets/w_logo.png',
	},
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
				<NextIntlClientProvider messages={messages}>
					<AntdRegistry>
						<ConfigProvider theme={theme}>
							<App>
								<NavBar user={user} />
								<main style={{ minHeight: 'calc(100vh - 64px)', background: '#F9F7F2' }}>
									{children}
								</main>
							</App>
						</ConfigProvider>
					</AntdRegistry>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
