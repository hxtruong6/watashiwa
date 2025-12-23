'use client';

import DeckListActions from '@/app/dashboard/decks/DeckListActions';
import {
	BookOutlined,
	CalendarOutlined,
	ClockCircleOutlined,
	RocketOutlined,
	TrophyOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Divider,
	Empty,
	Flex,
	Progress,
	Row,
	Tag,
	Typography,
	theme,
} from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface LearningDeck {
	id: string;
	title: string;
	titleEn: string | null;
	description: string | null;
	descriptionEn: string | null;
	headerImage: string | null;
	isPublic: boolean;
	_count: {
		vocabularies: number;
	};
	learningStats: {
		hasCards: boolean;
		dueCount: number;
		totalCards: number;
		masteredCount: number;
		lastStudied: Date | null;
		nextReview: Date | null;
	} | null;
}

interface CreatedDeck {
	id: string;
	title: string;
	titleEn: string | null;
	description: string | null;
	descriptionEn: string | null;
	headerImage: string | null;
	isPublic: boolean;
	authorId: string;
	createdAt: Date;
	learnersCount: number;
	_count: {
		vocabularies: number;
	};
}

interface MyDecksListProps {
	learningDecks: LearningDeck[];
	createdDecks: CreatedDeck[];
}

function formatRelativeTime(date: Date | null, t: any): string {
	if (!date) return t('neverStudied');

	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 3) return t('justNow');
	if (minutes < 60) return t('minutesAgo', { minutes });
	if (hours < 24) return t('hoursAgo', { hours });
	if (days === 1) return t('yesterday');
	return t('daysAgo', { days });
}

function formatNextReview(date: Date | null, t: any): string {
	if (!date) return t('noDue');
	const now = new Date();
	const diff = date.getTime() - now.getTime();

	if (diff <= 0) return t('dueCount', { count: 1 }); // Should be covered by dueCount but fallback

	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	return `${days}d`;
}

export default function MyDecksList({ learningDecks, createdDecks }: MyDecksListProps) {
	const { token } = useToken();
	const t = useTranslations('MyDecks');
	const locale = useLocale();
	const router = useRouter();

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
			{/* Header */}
			<Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 32 }}>
				<Col xs={24} sm={16}>
					<Title level={2} style={{ margin: 0, color: token.colorPrimary, fontSize: '1.75rem' }}>
						{t('title')}
					</Title>
					<Text type="secondary" style={{ fontSize: '0.9rem' }}>
						{t('subtitle')}
					</Text>
				</Col>
				<Col xs={24} sm={8}>
					<Flex justify="end" gap="small" wrap="wrap">
						<Link href="/decks">
							<Button>{t('browseLibrary')}</Button>
						</Link>
						<DeckListActions mode="create" />
					</Flex>
				</Col>
			</Row>

			{/* Section 1: Active Learning */}
			{learningDecks.length > 0 && (
				<>
					<div style={{ marginBottom: 16 }}>
						<Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
							<RocketOutlined style={{ color: token.colorPrimary }} />
							{t('activeLearning')}
						</Title>
						<Text type="secondary" style={{ fontSize: 14 }}>
							{t('activeLearningDesc')}
						</Text>
					</div>
					<Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
						{learningDecks.map((deck) => {
							const displayTitle = locale === 'en' ? deck.titleEn || deck.title : deck.title;
							const masteryPercent =
								deck.learningStats && deck.learningStats.totalCards > 0
									? Math.round(
											(deck.learningStats.masteredCount / deck.learningStats.totalCards) * 100,
										)
									: 0;

							return (
								<Col xs={24} sm={12} md={8} key={deck.id}>
									<Card
										hoverable
										onClick={() => router.push(`/decks/${deck.id}`)}
										style={{
											borderRadius: 16,
											height: '100%',
											cursor: 'pointer',
											borderColor:
												deck.learningStats && deck.learningStats.dueCount > 0
													? token.colorWarning
													: undefined,
										}}
									>
										{/* Due Badge (if any) */}
										{deck.learningStats && deck.learningStats.dueCount > 0 && (
											<Tag
												color="orange"
												style={{
													position: 'absolute',
													top: 12,
													right: 12,
													zIndex: 1,
													fontWeight: 600,
												}}
											>
												{t('dueCount', { count: deck.learningStats.dueCount })}
											</Tag>
										)}

										<Flex gap="middle" vertical>
											<Flex justify="space-between" align="start">
												<Title level={4} style={{ margin: 0, color: token.colorPrimary, flex: 1 }}>
													{displayTitle}
												</Title>
												{/* Progress Ring */}
												<Progress
													type="circle"
													percent={masteryPercent}
													size={50}
													strokeColor={token.colorSuccess}
													format={(percent) => (
														<span style={{ fontSize: 10, color: token.colorTextSecondary }}>
															{percent}%
														</span>
													)}
												/>
											</Flex>

											{/* Stats Grid */}
											<Flex vertical gap="small" style={{ marginTop: 8 }}>
												<Text type="secondary" style={{ fontSize: 12 }}>
													{t('mastered', {
														count: deck.learningStats?.masteredCount || 0,
														total: deck.learningStats?.totalCards || 0,
													})}
												</Text>

												<Flex align="center" gap="small">
													<ClockCircleOutlined style={{ color: token.colorTextSecondary }} />
													<Text type="secondary" style={{ fontSize: 13 }}>
														{t('lastStudied', {
															time: formatRelativeTime(deck.learningStats?.lastStudied || null, t),
														})}
													</Text>
												</Flex>

												{/* Next Review Time (if nothing due now) */}
												{deck.learningStats?.dueCount === 0 && deck.learningStats?.nextReview && (
													<Flex align="center" gap="small">
														<CalendarOutlined style={{ color: token.colorTextSecondary }} />
														<Text type="secondary" style={{ fontSize: 13 }}>
															{t('nextReviewIn', {
																time: formatNextReview(deck.learningStats.nextReview, t),
															})}
														</Text>
													</Flex>
												)}
											</Flex>

											{/* Study Button */}
											<div style={{ marginTop: 'auto', paddingTop: 16 }}>
												{deck.learningStats && deck.learningStats.dueCount > 0 ? (
													<Link
														href={`/study?deck=${deck.id}`}
														onClick={(e) => e.stopPropagation()}
													>
														<Button type="primary" block size="large" icon={<RocketOutlined />}>
															{t('studyNow')}
														</Button>
													</Link>
												) : (
													// Disabled / secondary button if nothing due
													<Link
														href={`/study?deck=${deck.id}`}
														onClick={(e) => e.stopPropagation()}
													>
														<Button block icon={<BookOutlined />}>
															{t('view')}
														</Button>
													</Link>
												)}
											</div>
										</Flex>
									</Card>
								</Col>
							);
						})}
					</Row>
					<Divider />
				</>
			)}

			{/* Section 2: My Created Decks */}
			{createdDecks.length > 0 && (
				<>
					<div style={{ marginBottom: 16 }}>
						<Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
							<TrophyOutlined style={{ color: token.colorWarning }} />
							{t('createdDecks')}
						</Title>
						<Text type="secondary" style={{ fontSize: 14 }}>
							{t('createdDecksDesc')}
						</Text>
					</div>
					<Row gutter={[24, 24]}>
						{createdDecks.map((deck) => {
							const displayTitle = locale === 'en' ? deck.titleEn || deck.title : deck.title;
							const displayDescription =
								locale === 'en' ? deck.descriptionEn || deck.description : deck.description;

							return (
								<Col xs={24} sm={12} md={8} lg={6} key={deck.id}>
									<Card
										hoverable
										onClick={() => router.push(`/decks/${deck.id}`)}
										style={{
											borderRadius: 16,
											height: '100%',
											cursor: 'pointer',
										}}
									>
										<Flex justify="space-between" align="start" style={{ marginBottom: 12 }}>
											<div
												style={{
													width: 48,
													height: 48,
													borderRadius: 12,
													background: token.colorBgContainer,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
											</div>
											<Flex gap="small">
												{deck.isPublic ? (
													<Tag color="blue">{t('public')}</Tag>
												) : (
													<Tag color="orange">{t('private')}</Tag>
												)}
											</Flex>
										</Flex>

										<Title level={4} style={{ margin: '0 0 8px', color: token.colorPrimary }}>
											{displayTitle}
										</Title>

										<Paragraph
											type="secondary"
											ellipsis={{ rows: 2 }}
											style={{ marginBottom: 16, minHeight: 44 }}
										>
											{displayDescription || t('noDescription')}
										</Paragraph>

										{/* Learners Count & Items */}
										<Flex gap="small" style={{ marginBottom: 16 }}>
											<Tag icon={<RocketOutlined />} color="default">
												{t('cardsCount', { count: deck._count.vocabularies })}
											</Tag>
											{deck.learnersCount > 0 && (
												<Tag icon={<UserOutlined />} color="gold">
													{t('learners', { count: deck.learnersCount })}
												</Tag>
											)}
										</Flex>

										<Flex
											align="center"
											justify="end"
											gap="small"
											onClick={(e) => e.stopPropagation()}
										>
											<Link href={`/decks/${deck.id}`}>
												<Button size="small">{t('view')}</Button>
											</Link>
											<DeckListActions mode="edit" deck={deck} />
										</Flex>
									</Card>
								</Col>
							);
						})}
					</Row>
				</>
			)}

			{/* Empty States */}
			{learningDecks.length === 0 && createdDecks.length === 0 && (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<Text type="secondary">{t('emptyState')}</Text>}
				>
					<Flex gap="small" justify="center" wrap="wrap">
						<Link href="/decks">
							<Button>{t('browseLibrary')}</Button>
						</Link>
						<DeckListActions mode="create" />
					</Flex>
				</Empty>
			)}
		</div>
	);
}
