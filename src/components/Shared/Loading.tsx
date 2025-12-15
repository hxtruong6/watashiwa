'use client';

import React from 'react';
import { Flex, Spin, theme, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { useToken } = theme;
const { Text } = Typography;

interface LoadingProps {
	fullScreen?: boolean;
	tip?: string;
	size?: 'small' | 'default' | 'large';
	fontSize?: number;
}

export default function Loading({
	fullScreen = false,
	tip,
	size = 'large',
	fontSize = 48,
}: LoadingProps) {
	const { token } = useToken();

	const indicator = (
		<LoadingOutlined
			style={{
				fontSize: fontSize,
				color: token.colorPrimary,
			}}
			spin
		/>
	);

	const content = (
		<Flex vertical align="center" gap="middle">
			<Spin indicator={indicator} size={size} />
			{tip && (
				<Text type="secondary" style={{ fontSize: 16 }}>
					{tip}
				</Text>
			)}
		</Flex>
	);

	if (fullScreen) {
		return (
			<Flex
				justify="center"
				align="center"
				style={{
					height: '100vh',
					width: '100vw',
					background: token.colorBgLayout, // Ensures dark theme background
					position: 'fixed',
					top: 0,
					left: 0,
					zIndex: 9999,
				}}
			>
				{content}
			</Flex>
		);
	}

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				width: '100%',
				height: '100%',
				minHeight: 200,
				background: 'transparent', // Inherit
			}}
		>
			{content}
		</Flex>
	);
}
