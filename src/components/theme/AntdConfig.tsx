'use client';

import { darkTheme, lightTheme } from '@/lib/theme/themeConfig';
import { App, ConfigProvider } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export default function AntdConfig({ children }: { children: React.ReactNode }) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true);
	}, []);

	// Render with default theme (light) during SSR to match initial HTML
	// After mount, switch to resolved theme
	const currentTheme = mounted ? (resolvedTheme === 'dark' ? darkTheme : lightTheme) : lightTheme;

	return (
		<ConfigProvider theme={currentTheme}>
			<App>{children}</App>
		</ConfigProvider>
	);
}
