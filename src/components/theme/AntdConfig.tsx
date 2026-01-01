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
		<ConfigProvider
			theme={currentTheme}
			getPopupContainer={() => {
				// Render popups in document.body to ensure proper coordinate system alignment
				// This works correctly now that body no longer has position: relative
				// Since this is a client component, document.body is always available
				return document.body;
			}}
		>
			<App>{children}</App>
		</ConfigProvider>
	);
}
