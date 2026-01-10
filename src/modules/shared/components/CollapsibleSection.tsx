'use client';

import { DownOutlined } from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface CollapsibleSectionProps {
	title: string;
	icon?: React.ReactNode;
	defaultExpanded?: boolean;
	onToggle?: (expanded: boolean) => void;
	children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
	title,
	icon,
	defaultExpanded = false,
	onToggle,
	children,
}) => {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const { token } = theme.useToken();

	return (
		<div
			style={{
				marginBottom: 16,
				borderRadius: token.borderRadius,
				background: token.colorFillAlter,
				overflow: 'hidden',
			}}
		>
			{/* Header with toggle */}
			<button
				type="button"
				onClick={() => {
					const newState = !expanded;
					setExpanded(newState);
					onToggle?.(newState);
				}}
				style={{
					width: '100%',
					padding: '12px 16px',
					background: 'transparent',
					border: 'none',
					cursor: 'pointer',
				}}
			>
				<Flex align="center" justify="space-between" style={{ width: '100%' }}>
					<Flex align="center" gap={8}>
						{icon}
						<Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
							{title}
						</Typography.Text>
					</Flex>
					<DownOutlined
						style={{
							fontSize: 12,
							color: token.colorTextTertiary,
							transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
							transition: 'transform 0.2s ease',
						}}
					/>
				</Flex>
			</button>

			{/* Content with animation */}
			<motion.div
				initial={false}
				animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
				style={{ overflow: 'hidden' }}
			>
				<div style={{ padding: '0 16px 16px' }}>{children}</div>
			</motion.div>
		</div>
	);
};
