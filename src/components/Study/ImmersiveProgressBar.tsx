'use client';

import React from 'react';
import { theme } from 'antd';

const { useToken } = theme;

interface ImmersiveProgressBarProps {
	percent: number;
}

export default function ImmersiveProgressBar({ percent }: ImmersiveProgressBarProps) {
	const { token } = useToken();

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				height: 4,
				background: 'rgba(0,0,0,0.05)', // Subtle track
				zIndex: 200,
			}}
		>
			<div
				style={{
					height: '100%',
					width: `${Math.min(100, Math.max(0, percent))}%`,
					background: token.colorSuccess,
					transition: 'width 0.5s ease',
					borderRadius: '0 2px 2px 0',
				}}
			/>
		</div>
	);
}
