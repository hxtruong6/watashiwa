'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ConfigProvider, App } from 'antd';
import { lightTheme, darkTheme } from '@/lib/theme/themeConfig';

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
