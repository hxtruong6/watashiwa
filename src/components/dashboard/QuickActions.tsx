'use client';

import React from 'react';
import { Typography, Card, Row, Col, Tooltip, theme } from 'antd';
import Link from 'next/link';
import {
	ReadOutlined,
	EditOutlined,
	BookOutlined,
	SearchOutlined,
	ImportOutlined,
	HeartOutlined,
	BarChartOutlined,
	TrophyOutlined,
	SettingOutlined,
	LockOutlined,
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;
const { useToken } = theme;

interface QuickAction {
	key: string;
	icon: React.ReactNode;
	labelKey: string;
	href: string;
	enabled: boolean;
	color: string;
}

/**
 * Quick actions grid with enabled and "coming soon" items
 */
export default function QuickActions() {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const tCommon = useTranslations('Common');

	const actions: QuickAction[] = [
		{
			key: 'vocab',
			icon: <ReadOutlined />,
			labelKey: 'allVocab',
			href: '/dashboard/vocab',
			enabled: true,
			color: token.colorPrimary,
		},
		{
			key: 'kanji',
			icon: <EditOutlined />,
			labelKey: 'allKanji',
			href: '/dashboard/kanji',
			enabled: true,
			color: '#722ed1',
		},
		{
			key: 'decks',
			icon: <BookOutlined />,
			labelKey: 'viewDecks',
			href: '/decks',
			enabled: true,
			color: token.colorPrimary,
		},
		{
			key: 'browse',
			icon: <SearchOutlined />,
			labelKey: 'browseLibrary',
			href: '/browse',
			enabled: false,
			color: token.colorSuccess,
		},
		{
			key: 'import',
			icon: <ImportOutlined />,
			labelKey: 'importCards',
			href: '/decks/import',
			enabled: false,
			color: '#fa8c16',
		},
		{
			key: 'wishlist',
			icon: <HeartOutlined />,
			labelKey: 'wishlist',
			href: '/wishlist',
			enabled: false,
			color: '#eb2f96',
		},
		{
			key: 'stats',
			icon: <BarChartOutlined />,
			labelKey: 'statistics',
			href: '/stats',
			enabled: false,
			color: '#13c2c2',
		},
		{
			key: 'leaderboard',
			icon: <TrophyOutlined />,
			labelKey: 'leaderboard',
			href: '/leaderboard',
			enabled: false,
			color: token.colorWarning,
		},
		{
			key: 'settings',
			icon: <SettingOutlined />,
			labelKey: 'settings',
			href: '/settings',
			enabled: false,
			color: token.colorTextSecondary,
		},
	];

	const renderAction = (action: QuickAction) => {
		const content = (
			<Card
				size="small"
				style={{
					textAlign: 'center',
					borderRadius: 16,
					border: '1px solid #f0f0f0',
					boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
					opacity: action.enabled ? 1 : 0.6,
					cursor: action.enabled ? 'pointer' : 'not-allowed',
					position: 'relative',
					height: '100%',
				}}
				hoverable={action.enabled}
			>
				{!action.enabled && (
					<LockOutlined
						style={{
							position: 'absolute',
							top: 8,
							right: 8,
							fontSize: 10,
							color: '#bfbfbf',
						}}
					/>
				)}
				<div style={{ fontSize: 24, color: action.color, marginBottom: 4 }}>{action.icon}</div>
				<Text strong style={{ display: 'block', fontSize: 12 }}>
					{t(action.labelKey)}
				</Text>
				{!action.enabled && (
					<Text type="secondary" style={{ fontSize: 10 }}>
						{tCommon('soon')}
					</Text>
				)}
			</Card>
		);

		if (action.enabled) {
			return (
				<Col xs={8} sm={6} md={4} key={action.key}>
					<Link href={action.href}>
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							style={{ height: '100%' }}
						>
							{content}
						</motion.div>
					</Link>
				</Col>
			);
		}

		return (
			<Col xs={8} sm={6} md={4} key={action.key}>
				<Tooltip title={tCommon('soon')}>{content}</Tooltip>
			</Col>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			style={{ marginBottom: 32 }}
		>
			<Title level={5} style={{ marginBottom: 16, color: token.colorPrimary }}>
				{t('features')}
			</Title>
			<Row gutter={[12, 12]}>{actions.map(renderAction)}</Row>
		</motion.div>
	);
}
