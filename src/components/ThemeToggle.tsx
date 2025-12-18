'use client';

import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// eslint-disable-next-line
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return <Button type="text" shape="circle" icon={<SunOutlined />} disabled />;
	}

	const isDark = resolvedTheme === 'dark';

	return (
		<Button
			type="text"
			shape="circle"
			icon={isDark ? <MoonOutlined /> : <SunOutlined />}
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
			style={{ transition: 'all 0.3s' }}
		/>
	);
}
