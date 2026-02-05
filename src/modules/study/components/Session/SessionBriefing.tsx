'use client';

import type { SmartCard } from '@/modules/flashcard/types';
import { Button, Flex, Space, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

/** Approximate seconds per card for estimated time (new + review average). */
const SECONDS_PER_CARD = 25;

/** Get display label for a card (word surface / hero) for the briefing word list. */
function getCardDisplayWord(card: SmartCard): string {
	if (card.variant === 'BASIC' && card.front?.hero) return card.front.hero;
	if (card.variant === 'GAP_FILL' && card.back?.details)
		return (card.back.details as { wordSurface?: string }).wordSurface ?? '';
	if (card.variant === 'INTERVENTION' && card.comparison?.itemA)
		return (card.comparison.itemA as { wordSurface?: string }).wordSurface ?? '';
	const details = card.back?.details as { wordSurface?: string } | undefined;
	return details?.wordSurface ?? '';
}

interface SessionBriefingProps {
	queue: SmartCard[];
	/** Optional session stats (e.g. dailyStats); breakdown is derived from queue. */
	stats?: unknown;
	onStart: () => void;
	/** Called when user clicks "Don't show this screen again"; parent should persist preference and transition to quiz. */
	onDonShowAgain?: () => void;
}

export default function SessionBriefing({ queue, onStart, onDonShowAgain }: SessionBriefingProps) {
	const t = useTranslations('Study.briefing');
	const { token } = useToken();

	const { newCount, reviewCount } = useMemo(() => {
		const newC = queue.filter((c) => c.srsStage === 0).length;
		const reviewC = queue.length - newC;
		return { newCount: newC, reviewCount: reviewC };
	}, [queue]);

	const wordsList = useMemo(() => queue.map(getCardDisplayWord).filter(Boolean), [queue]);

	const estimatedMinutes = useMemo(
		() => Math.max(1, Math.ceil((queue.length * SECONDS_PER_CARD) / 60)),
		[queue.length],
	);

	const hasNew = newCount > 0;
	const hasReview = reviewCount > 0;
	const hasBreakdown = hasNew || hasReview;

	return (
		<Flex
			vertical
			align="center"
			gap={token.marginLG}
			style={{
				padding: token.paddingLG,
				textAlign: 'center',
				maxWidth: '90%',
				margin: '0 auto',
			}}
		>
			{/* Title and optional subtitle */}
			<Title level={3} style={{ margin: 0 }}>
				{t('title')}
			</Title>
			<Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
				{t('subtitle')}
			</Text>

			{/* Summary question — reinforces total */}
			<Text style={{ fontSize: token.fontSize, color: token.colorText }}>
				{t('readyToReview', { count: queue.length })}
			</Text>

			{/* Preview block: breakdown + total (Zen: one clear unit) */}
			{hasBreakdown && (
				<Flex
					vertical
					gap={token.marginMD}
					style={{
						width: '100%',
						textAlign: 'left',
						background: token.colorFillAlter,
						border: `1px solid ${token.colorBorderSecondary}`,
						borderRadius: token.borderRadiusLG,
						padding: token.paddingLG,
					}}
				>
					<Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
						{hasNew && (
							<div>
								<Text
									type="secondary"
									style={{
										fontSize: token.fontSizeSM,
										textTransform: 'uppercase',
										letterSpacing: '0.02em',
									}}
								>
									{t('sectionNew')}
								</Text>
								<div>
									<Text strong>{t('missionNew', { count: newCount })}</Text>
								</div>
								<Text
									type="secondary"
									style={{ fontSize: token.fontSizeSM, display: 'block', marginTop: 2 }}
								>
									{t('sectionNewHint')}
								</Text>
							</div>
						)}
						{hasReview && (
							<div>
								<Text
									type="secondary"
									style={{
										fontSize: token.fontSizeSM,
										textTransform: 'uppercase',
										letterSpacing: '0.02em',
									}}
								>
									{t('sectionReview')}
								</Text>
								<div>
									<Text strong>{t('missionReview', { count: reviewCount })}</Text>
								</div>
								<Text
									type="secondary"
									style={{ fontSize: token.fontSizeSM, display: 'block', marginTop: 2 }}
								>
									{t('sectionReviewHint')}
								</Text>
							</div>
						)}
					</Space>
					{/* Explicit total + estimated time */}
					<div
						style={{
							borderTop: `1px solid ${token.colorBorderSecondary}`,
							paddingTop: token.paddingSM,
							marginTop: token.marginXS,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: token.marginXS,
						}}
					>
						<Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
							{t('totalCards', { count: queue.length })}
						</Text>
						<Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
							{t('estimatedTime', { minutes: estimatedMinutes })}
						</Text>
					</div>
				</Flex>
			)}

			{/* Estimated time when no breakdown (e.g. review-only session) */}
			{!hasBreakdown && queue.length > 0 && (
				<Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
					{t('estimatedTime', { minutes: estimatedMinutes })}
				</Text>
			)}

			{/* All words in this session */}
			{wordsList.length > 0 && (
				<Flex
					vertical
					gap={token.marginXS}
					style={{
						width: '100%',
						textAlign: 'left',
						background: token.colorFillAlter,
						border: `1px solid ${token.colorBorderSecondary}`,
						borderRadius: token.borderRadiusLG,
						padding: token.paddingMD,
						maxHeight: 500,
						overflow: 'auto',
					}}
				>
					<Text
						type="secondary"
						style={{
							fontSize: token.fontSizeSM,
							textTransform: 'uppercase',
							letterSpacing: '0.02em',
						}}
					>
						{t('wordsInSession')}
					</Text>
					<Flex wrap="wrap" gap={token.marginXS}>
						{wordsList.map((word, i) => (
							<span
								key={`${word}-${i}`}
								style={{
									fontSize: token.fontSize,
									padding: `${token.paddingXS}px ${token.paddingSM}px`,
									background: token.colorBgContainer,
									borderRadius: token.borderRadiusSM,
									border: `1px solid ${token.colorBorderSecondary}`,
								}}
							>
								{word}
							</span>
						))}
					</Flex>
				</Flex>
			)}

			{/* Actions: single primary CTA + "Don't show this screen again" link (Option B) */}
			<Flex vertical gap={token.marginSM} style={{ width: '100%', marginTop: token.marginXS }}>
				<Button type="primary" size="large" onClick={onStart} block>
					{t('startSession')}
				</Button>
				{onDonShowAgain && (
					<Button
						type="text"
						onClick={onDonShowAgain}
						style={{
							background: 'none',
							border: 'none',
							padding: 0,
							marginTop: token.marginXS,
							color: token.colorTextSecondary,
							fontSize: token.fontSizeSM,
							textDecoration: 'underline',
							cursor: 'pointer',
						}}
					>
						{t('donShowScreenAgain')}
					</Button>
				)}
			</Flex>
		</Flex>
	);
}
