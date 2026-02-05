/**
 * Empty State Component for Study Session
 *
 * Handles 3 scenarios with appropriate messaging and CTAs
 */

'use client';

import { BookOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface SessionEmptyStateProps {
	scenario: 'NO_DECK' | 'ALL_CAUGHT_UP' | 'DECK_EMPTY';
	deckId?: string;
}

export const SessionEmptyState: React.FC<SessionEmptyStateProps> = ({ scenario, deckId }) => {
	const { token } = useToken();
	const t = useTranslations('Study.emptyState');

	// Practice More: start another session with this deck (e.g. new cards). Use /study with deckId when available; otherwise /decks.
	const studyAheadHref = deckId ? `/study?deckId=${deckId}` : '/decks';

	const configs = {
		NO_DECK: {
			icon: <BookOutlined style={{ fontSize: 64, color: token.colorTextSecondary }} />,
			title: t('noDeckTitle'),
			message: t('noDeckMessage'),
			emotion: 'calm' as const,
			actions: [
				{
					label: t('browseLibrary'),
					icon: <BookOutlined />,
					href: '/decks',
					type: 'primary' as const,
				},
				{
					label: t('goHome'),
					href: '/',
					type: 'default' as const,
				},
			],
		},
		ALL_CAUGHT_UP: {
			icon: <CheckCircleOutlined style={{ fontSize: 64, color: token.colorSuccess }} />,
			title: t('allCaughtUpTitle'),
			message: t('allCaughtUpMessage'),
			emotion: 'accomplished' as const,
			actions: [
				{
					label: t('studyAhead'),
					icon: <RocketOutlined />,
					href: studyAheadHref,
					type: 'primary' as const,
				},
				{
					label: t('browseOtherDecks'),
					icon: <BookOutlined />,
					href: '/decks',
					type: 'default' as const,
				},
			],
		},
		DECK_EMPTY: {
			icon: <BookOutlined style={{ fontSize: 64, color: token.colorWarning }} />,
			title: t('deckEmptyTitle'),
			message: t('deckEmptyMessage'),
			emotion: 'calm' as const,
			actions: [
				...(deckId
					? [
							{
								label: t('viewDeckDetails'),
								href: `/decks/${deckId}`,
								type: 'primary' as const,
							},
						]
					: []),
				{
					label: t('browseLibrary'),
					icon: <BookOutlined />,
					href: '/decks',
					type: (deckId ? 'default' : 'primary') as 'primary' | 'default',
				},
			],
		},
	};

	const config = configs[scenario];
	const zenQuote = config.emotion === 'accomplished' ? t('zenAccomplished') : t('zenCalm');

	return (
		<Flex
			vertical
			align="center"
			justify="center"
			gap="large"
			style={{
				minHeight: '400px',
				padding: token.paddingLG,
				textAlign: 'center',
			}}
		>
			<div>{config.icon}</div>

			<Title
				level={3}
				style={{
					margin: 0,
					color: token.colorTextHeading,
				}}
			>
				{config.title}
			</Title>

			<Paragraph
				style={{
					maxWidth: 400,
					color: token.colorTextSecondary,
					fontSize: 16,
					margin: 0,
				}}
			>
				{config.message}
			</Paragraph>

			<div
				style={{
					background: token.colorFillAlter,
					padding: '12px 24px',
					borderRadius: token.borderRadius,
					borderLeft: `4px solid ${token.colorPrimary}`,
				}}
			>
				<Text
					style={{
						fontSize: 14,
						fontStyle: 'italic',
						color: token.colorTextSecondary,
					}}
				>
					{zenQuote}
				</Text>
			</div>

			<Flex gap="middle" wrap="wrap" justify="center">
				{config.actions.map((action, index) => (
					<Link key={index} href={action.href} prefetch={true}>
						<Button
							type={action.type}
							size="large"
							icon={action.icon}
							style={{
								minWidth: 160,
								height: 48,
							}}
						>
							{action.label}
						</Button>
					</Link>
				))}
			</Flex>
		</Flex>
	);
};
