'use client';

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import AntdConfig from './AntdConfig';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<AntdConfig>{children}</AntdConfig>
		</NextThemeProvider>
	);
}
