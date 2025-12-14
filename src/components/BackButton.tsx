'use client';

import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
	/**
	 * Path to navigate to if history back is not desired or as a fallback.
	 */
	fallbackPath?: string;
	style?: React.CSSProperties;
	className?: string;
	/**
	 * If true, uses a ghost button (transparent background, usually white text if set in theme or style).
	 * Useful for dark backgrounds.
	 */
	ghost?: boolean;
	/**
	 * Optional color override for the icon.
	 */
	color?: string;
}

export default function BackButton({
	fallbackPath = '/',
	style,
	className,
	ghost,
	color,
}: BackButtonProps) {
	const router = useRouter();

	const handleBack = () => {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push(fallbackPath);
		}
	};

	return (
		<Button
			type="text"
			icon={<ArrowLeftOutlined style={{ color }} />}
			onClick={handleBack}
			ghost={ghost}
			style={{
				fontSize: '18px', // Slightly larger icon
				width: 44,
				height: 44,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: '50%',
				...style,
			}}
			className={className}
		/>
	);
}
