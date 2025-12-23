/**
 * Empty State Component for Study Session
 *
 * Handles 3 scenarios with appropriate messaging and CTAs
 */

'use client';

import { BookOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface SessionEmptyStateProps {
	scenario: 'NO_DECK' | 'ALL_CAUGHT_UP' | 'DECK_EMPTY';
	deckId?: string;
}

export const SessionEmptyState: React.FC<SessionEmptyStateProps> = ({ scenario, deckId }) => {
	const { token } = useToken();
	const router = useRouter();

	const configs = {
		NO_DECK: {
			icon: <BookOutlined style={{ fontSize: 64, color: token.colorTextSecondary }} />,
			title: 'No Deck Selected',
			message: 'The study session requires a deck context.',
			emotion: 'calm',
			actions: [
				{
					label: 'Browse Library',
					icon: <BookOutlined />,
					onClick: () => router.push('/decks'),
					type: 'primary' as const,
				},
				{
					label: 'Go Home',
					onClick: () => router.push('/'),
					type: 'default' as const,
				},
			],
		},
		ALL_CAUGHT_UP: {
			icon: <CheckCircleOutlined style={{ fontSize: 64, color: token.colorSuccess }} />,
			title: 'All Caught Up',
			message: 'No reviews due right now. Your memory is stable.',
			emotion: 'accomplished',
			actions: [
				{
					label: 'Study Ahead',
					icon: <RocketOutlined />,
					onClick: () => router.push(`/exercises?deckId=${deckId}`),
					type: 'primary' as const,
				},
				{
					label: 'Browse Other Decks',
					icon: <BookOutlined />,
					onClick: () => router.push('/decks'),
					type: 'default' as const,
				},
			],
		},
		DECK_EMPTY: {
			icon: <BookOutlined style={{ fontSize: 64, color: token.colorWarning }} />,
			title: 'Deck Has No Content',
			message: 'This deck needs verified vocabulary before you can study.',
			emotion: 'calm',
			actions: [
				{
					label: 'View Deck Details',
					onClick: () => router.push(`/decks/${deckId}`),
					type: 'primary' as const,
				},
				{
					label: 'Browse Library',
					icon: <BookOutlined />,
					onClick: () => router.push('/decks'),
					type: 'default' as const,
				},
			],
		},
	};

	const config = configs[scenario];

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
			{/* Icon */}
			<div>{config.icon}</div>

			{/* Title */}
			<Title
				level={3}
				style={{
					margin: 0,
					color: token.colorTextHeading,
				}}
			>
				{config.title}
			</Title>

			{/* Message */}
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

			{/* The Zen Wisdom: Calm the user */}
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
					{config.emotion === 'accomplished'
						? '「休むも相場」 — Rest is part of mastery.'
						: '「焦らず丁寧に」 — No rush. Precision over speed.'}
				</Text>
			</div>

			{/* Action Buttons */}
			<Flex gap="middle" wrap="wrap" justify="center">
				{config.actions.map((action, index) => (
					<Button
						key={index}
						type={action.type}
						size="large"
						icon={action.icon}
						onClick={action.onClick}
						style={{
							minWidth: 160,
							height: 48,
						}}
					>
						{action.label}
					</Button>
				))}
			</Flex>
		</Flex>
	);
};
