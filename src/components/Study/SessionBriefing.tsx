'use client';

import React from 'react';
import { Button, Typography, Layout, theme, Flex, List, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { StudyCardWithDetails } from '@/services/actions';
import { SoundOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useFlashCardAudio } from '@/hooks/study/useFlashCardAudio';
import { DEFAULT_LIMIT_NEW_CARDS, DEFAULT_LIMIT_REVIEWS } from '@/lib/constants';

const { Text, Title } = Typography;
const { useToken } = theme;

interface SessionBriefingProps {
	queue: StudyCardWithDetails[];
	stats: {
		limitNewCards: number;
		newCardsToday: number;
		limitReviews: number;
		reviewsToday: number;
		reviewsAvailable: number;
	};
	onStart: () => void;
}

export default function SessionBriefing({ queue, stats, onStart }: SessionBriefingProps) {
	const t = useTranslations('Study');
	const { token } = useToken();

	// Filter cards
	const newCards = queue.filter((c) => c.state === 0);

	// Briefing Spec: Only show "Leech" / Critical cards (Difficulty > 6 or Lapses > 0)
	// Normal reviews are skipped in the briefing to reduce anxiety/noise.
	const criticalReviewCards = queue.filter(
		(c) => c.state !== 0 && ((c.lapses ?? 0) > 0 || c.difficulty > 6),
	);

	// Calculate Mission Counts (Goals)
	const remainingNew = Math.max(
		0,
		(stats?.limitNewCards || DEFAULT_LIMIT_NEW_CARDS) - (stats?.newCardsToday || 0),
	);
	const reviewsDue = stats?.reviewsAvailable || 0;
	// Cap reviewsDue by remaining daily limit if needed, but showing total due is usually better motivation
	// actually standard is min(available, limit - today)
	const remainingReviewsLimit = Math.max(
		0,
		(stats?.limitReviews || DEFAULT_LIMIT_REVIEWS) - (stats?.reviewsToday || 0),
	);
	const missionReviewCount = Math.min(reviewsDue, remainingReviewsLimit);

	return (
		<Layout
			style={{
				height: '100vh',
				background: token.colorBgContainer, // Zen white/dark
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* 1. Header Area */}
			<div
				style={{
					padding: '40px 24px 20px',
					textAlign: 'center',
					background: `linear-gradient(to bottom, ${token.colorBgLayout}, ${token.colorBgContainer})`,
				}}
			>
				<Title level={2} style={{ margin: 0, marginBottom: 8 }}>
					{t('briefing.title')}
				</Title>
				<Text type="secondary">
					{remainingNew > 0 && t('briefing.missionNew', { count: remainingNew })}
					{remainingNew > 0 && missionReviewCount > 0 && ' • '}
					{missionReviewCount > 0 && t('briefing.missionReview', { count: missionReviewCount })}
				</Text>
			</div>

			{/* 2. Scrollable Content */}
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					padding: '0 16px 120px', // Extra padding bottom for fixed button
				}}
			>
				<div style={{ maxWidth: 600, margin: '0 auto' }}>
					{/* Section: New Arrivals */}
					{newCards.length > 0 && (
						<div style={{ marginBottom: 32 }}>
							<Flex align="center" gap="small" style={{ marginBottom: 16 }}>
								<Tag color="blue" style={{ margin: 0 }}>
									NEW
								</Tag>
								<Text strong style={{ fontSize: 16 }}>
									{t('briefing.sectionNew')}
								</Text>
							</Flex>
							<List
								dataSource={newCards}
								renderItem={(card) => {
									const isVocab = !!card.vocab;
									const mainText = isVocab ? card.vocab?.wordSurface : card.kanji?.kanji || '???';
									const meaning = isVocab ? card.vocab?.meaning : card.kanji?.meaning || '';
									return (
										<BriefingItem
											key={card.id}
											card={card}
											mainText={mainText || '???'}
											meaning={meaning || ''}
											isNew
										/>
									);
								}}
							/>
						</div>
					)}

					{/* Section: Critical Review */}
					{criticalReviewCards.length > 0 && (
						<div>
							<Flex align="center" gap="small" style={{ marginBottom: 16 }}>
								<Tag color="orange" style={{ margin: 0 }}>
									REVIEW
								</Tag>
								<Text strong style={{ fontSize: 16 }}>
									{t('briefing.sectionReview')}
								</Text>
							</Flex>
							<List
								dataSource={criticalReviewCards}
								renderItem={(item) => {
									const mainText = item.vocab?.wordSurface || item.kanji?.kanji || '???';
									const meaning = item.vocab?.meaning || item.kanji?.meaning || '';

									return (
										<BriefingItem key={item.id} card={item} mainText={mainText} meaning={meaning} />
									);
								}}
							/>
						</div>
					)}
				</div>
			</div>

			{/* 3. Footer Action */}
			<div
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					padding: '24px',
					background: `linear-gradient(to top, ${token.colorBgContainer} 80%, transparent)`,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Button
					type="primary"
					size="large"
					onClick={onStart}
					style={{
						height: 56,
						borderRadius: 28,
						fontSize: 18,
						fontWeight: 600,
						width: '100%',
						maxWidth: 400,
						boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
					}}
				>
					{t('briefing.startSession')}
				</Button>
			</div>
		</Layout>
	);
}

function BriefingItem({
	card,
	mainText,
	meaning,
	isNew,
}: {
	card: StudyCardWithDetails;
	mainText: string;
	meaning: string;
	isNew?: boolean;
}) {
	const { token } = useToken();

	// Audio hook
	const { playAudio, isPlaying } = useFlashCardAudio({
		card,
		showAnswer: true, // Always allow audio in briefing
		autoPlayAudio: 'off',
	});

	return (
		<List.Item
			style={{
				padding: '12px 16px',
				border: 'none',
				marginBottom: 8,
				background: token.colorFillQuaternary,
				borderRadius: 12,
			}}
		>
			<Flex justify="space-between" align="center" style={{ width: '100%' }}>
				<Flex gap="middle" align="center" style={{ flex: 1, overflow: 'hidden' }}>
					{/* Audio Button */}
					<Button
						type="text"
						shape="circle"
						icon={
							isPlaying ? (
								<SoundOutlined style={{ color: token.colorPrimary }} />
							) : (
								<PlayCircleOutlined style={{ color: token.colorTextSecondary }} />
							)
						}
						onClick={(e) => {
							e.stopPropagation();
							playAudio();
						}}
						loading={isPlaying}
						style={{
							background: token.colorBgContainer,
						}}
					/>

					<Flex vertical style={{ flex: 1, overflow: 'hidden' }}>
						<Text strong style={{ fontSize: 18, lineHeight: 1.2 }}>
							{mainText}
						</Text>
						<Text type="secondary" ellipsis style={{ fontSize: 13 }}>
							{meaning}
						</Text>
					</Flex>
				</Flex>

				{/* State Badge */}
				{isNew ? (
					<Tag color="blue" style={{ margin: 0 }}>
						NEW
					</Tag>
				) : card.state === 0 ? (
					<Tag color="blue" style={{ margin: 0 }}>
						New
					</Tag>
				) : (card.lapses ?? 0) > 0 ? (
					<Tag color="red" style={{ margin: 0 }}>
						Leech
					</Tag>
				) : (
					<Tag color="orange" style={{ margin: 0 }}>
						Review
					</Tag>
				)}
			</Flex>
		</List.Item>
	);
}
