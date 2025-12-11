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
	title: 'JLPT Mastery SRS',
	description: 'Learn Japanese with Spaced Repetition',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<AntdRegistry>
					<ConfigProvider theme={theme}>
						<App>
							<NavBar />
							<main style={{ minHeight: 'calc(100vh - 64px)', background: '#F9F7F2' }}>
								{children}
							</main>
						</App>
					</ConfigProvider>
				</AntdRegistry>
			</body>
		</html>
	);
}
