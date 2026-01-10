/**
 * HanVietBadge - Shared Component
 *
 * Consistent display component for Hán Việt (Sino-Vietnamese) text
 * Used across the app for vocabulary cards, preview modals, and etymology sections
 */
'use client';

import { Typography, theme } from 'antd';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface HanVietBadgeProps {
	hanViet: string;
	/**
	 * Size variant: 'small' | 'medium' | 'large'
	 * @default 'medium'
	 */
	size?: 'small' | 'medium' | 'large';
	/**
	 * Optional custom className
	 */
	className?: string;
	/**
	 * Optional custom style override
	 */
	style?: React.CSSProperties;
}

/**
 * Shared HanVietBadge component for consistent styling across the app
 *
 * Uses design tokens for consistent appearance:
 * - Primary color background and border
 * - Primary text color
 * - Responsive font sizing
 * - Proper letter spacing for readability
 */
export function HanVietBadge({ hanViet, size = 'medium', className, style }: HanVietBadgeProps) {
	const { token } = useToken();

	// Size-based styling
	const sizeStyles = {
		small: {
			fontSize: '10px',
			padding: '2px 6px',
			height: '20px',
		},
		medium: {
			fontSize: '11px',
			padding: '2px 8px',
			height: '24px',
		},
		large: {
			fontSize: '13px',
			padding: '4px 12px',
			height: '28px',
		},
	};

	const currentSizeStyle = sizeStyles[size];

	return (
		<div
			className={className}
			style={{
				background: token.colorPrimaryBg,
				padding: currentSizeStyle.padding,
				borderRadius: token.borderRadius,
				border: `1px solid ${token.colorPrimaryBorder}`,
				display: 'inline-flex',
				alignItems: 'center',
				height: currentSizeStyle.height,
				...style,
			}}
		>
			<Text
				strong
				style={{
					color: token.colorPrimary,
					fontSize: currentSizeStyle.fontSize,
					letterSpacing: '0.05em',
					lineHeight: 1,
				}}
			>
				{hanViet}
			</Text>
		</div>
	);
}
