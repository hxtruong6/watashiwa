'use client';

import { theme } from 'antd';
import React, { memo } from 'react';

const { useToken } = theme;

interface GlassDockProps {
	children: React.ReactNode;
	style?: React.CSSProperties;
}

/**
 * GlassDock Component
 * Theme-aware glass morphism container with backdrop blur
 */
function GlassDock({ children, style }: GlassDockProps) {
	const { token } = useToken();

	// Dark theme aware shadow
	const isDark = token.colorBgBase === '#151F32';
	const shadowColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';

	return (
		<div
			style={{
				background: `color-mix(in srgb, ${token.colorBgContainer} 80%, transparent)`,
				backdropFilter: 'blur(16px)',
				borderRadius: '24px',
				border: `1px solid ${token.colorBorderSecondary}`,
				boxShadow: `0 8px 32px ${shadowColor}`,
				padding: '8px 16px',
				display: 'flex',
				alignItems: 'center',
				gap: '16px',
				transition: 'transform 0.3s ease',
				...style,
			}}
		>
			{children}
		</div>
	);
}

export default memo(GlassDock);
