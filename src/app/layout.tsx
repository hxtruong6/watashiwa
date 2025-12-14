import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ThemeProvider from '@/components/theme/ThemeProvider';
import NavBar from '@/components/NavBar';
import PostHogPageTracker from '@/components/Analytics/PostHogPageTracker';
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
