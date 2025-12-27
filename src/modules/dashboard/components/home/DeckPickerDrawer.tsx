'use client';

import { BookOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, Flex, Tag, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useMemo } from 'react';

const { Text, Title } = Typography;
const { useToken } = theme;

interface DeckWithStats {
	id: string;
	slug: string;
	title: string;
	cardCount: number;
	dueCount: number;
}

interface DeckPickerDrawerProps {
	open: boolean;
	onClose: () => void;
	decks: DeckWithStats[];
}

interface GroupedDecks {
	actionable: DeckWithStats[]; // dueCount > 0
	available: DeckWithStats[]; // dueCount = 0 but cardCount > 0
	empty: DeckWithStats[]; // cardCount = 0
}

/**
 * Deck Picker Drawer: Opens when user chooses "Pick a deck"
 * Smart UX: Shows 5-8 most actionable decks, grouped by priority
 *
 * Strategy:
 * - Priority 1: Decks with due cards (actionable NOW)
 * - Priority 2: Decks with cards but nothing due (available for new learning)
 * - Priority 3: Empty decks (hidden or collapsed)
 *
 * Limits to 5-8 decks to reduce decision fatigue (Gen Z UX principle)
 */
export default function DeckPickerDrawer({ open, onClose, decks }: DeckPickerDrawerProps) {
	const { token } = useToken();
	const t = useTranslations('Dashboard');

	// Smart grouping and prioritization
	const { groupedDecks, totalActionable, totalAvailable, hasMore } = useMemo(() => {
		// Guard against negative values and normalize
		const normalizedDecks = decks.map((deck) => ({
			...deck,
			dueCount: Math.max(0, deck.dueCount),
			cardCount: Math.max(0, deck.cardCount),
		}));

		// Group decks by priority
		const grouped: GroupedDecks = {
			actionable: [],
			available: [],
			empty: [],
		};

		normalizedDecks.forEach((deck) => {
			if (deck.dueCount > 0) {
				grouped.actionable.push(deck);
			} else if (deck.cardCount > 0) {
				grouped.available.push(deck);
			} else {
				grouped.empty.push(deck);
			}
		});

		// Sort actionable: highest dueCount first, then highest cardCount
		grouped.actionable.sort((a, b) => {
			if (b.dueCount !== a.dueCount) {
				return b.dueCount - a.dueCount;
			}
			return b.cardCount - a.cardCount;
		});

		// Sort available: highest cardCount first (more content = better for new learning)
		grouped.available.sort((a, b) => b.cardCount - a.cardCount);

		// Limit display: Show max 5 actionable + 3 available = 8 total (optimal for decision-making)
		const MAX_ACTIONABLE = 5;
		const MAX_AVAILABLE = 3;
		const displayActionable = grouped.actionable.slice(0, MAX_ACTIONABLE);
		const displayAvailable = grouped.available.slice(0, MAX_AVAILABLE);

		return {
			groupedDecks: {
				actionable: displayActionable,
				available: displayAvailable,
				empty: grouped.empty, // Keep for "View All" but don't display
			},
			totalActionable: grouped.actionable.length,
			totalAvailable: grouped.available.length,
			hasMore:
				grouped.actionable.length > MAX_ACTIONABLE || grouped.available.length > MAX_AVAILABLE,
		};
	}, [decks]);

	const handleDeckSelect = () => {
		onClose();
		// Navigation handled by Link
	};

	return (
		<Drawer
			title={
				<Flex align="center" gap="small">
					<BookOutlined style={{ color: token.colorPrimary }} />
					<Title level={4} style={{ margin: 0 }}>
						{t('myDecks')}
					</Title>
				</Flex>
			}
			placement="bottom"
			height="clamp(400px, 80vh, 90vh)"
			onClose={onClose}
			open={open}
			styles={{
				body: {
					padding: '24px 16px',
				},
			}}
		>
			<Flex vertical gap="middle">
				{/* Summary Header */}
				{totalActionable > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						style={{ marginBottom: 8 }}
					>
						<Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
							{totalActionable > 1
								? t('decksWithDue', { count: totalActionable })
								: t('deckWithDue', { count: 1 })}
							{totalAvailable > 0 && ` • ${totalAvailable} ${t('availableDecks')}`}
						</Text>
					</motion.div>
				)}

				{/* Actionable Decks (Priority 1: Due Cards) */}
				{groupedDecks.actionable.length > 0 && (
					<>
						{groupedDecks.actionable.length > 1 && (
							<Text
								strong
								style={{
									fontSize: 13,
									color: token.colorPrimary,
									marginBottom: 8,
									textTransform: 'uppercase',
									letterSpacing: 0.5,
								}}
							>
								{t('actionableNow')}
							</Text>
						)}
						<Flex vertical gap="small">
							{groupedDecks.actionable.map((deck, index) => {
								const isRecommended = index === 0 && deck.dueCount > 0;
								// Safe null check for slug
								const studyUrl =
									deck.slug && deck.slug.trim() !== ''
										? `/study?deckSlug=${deck.slug}`
										: `/study?deckId=${deck.id}`;

								return (
									<motion.div
										key={deck.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
									>
										<Link href={studyUrl} onClick={handleDeckSelect}>
											<Flex
												align="center"
												justify="space-between"
												wrap="wrap"
												style={{
													padding: '16px',
													borderRadius: 12,
													border: isRecommended
														? `2px solid ${token.colorPrimary}`
														: `1px solid ${token.colorBorderSecondary}`,
													background: isRecommended ? token.colorPrimaryBg : token.colorBgContainer,
													cursor: 'pointer',
													transition: 'all 0.2s',
													gap: 12,
												}}
												onMouseEnter={(e) => {
													if (
														typeof window !== 'undefined' &&
														window.matchMedia('(hover: hover)').matches
													) {
														e.currentTarget.style.transform = 'translateY(-2px)';
														e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
													}
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.transform = 'translateY(0)';
													e.currentTarget.style.boxShadow = 'none';
												}}
												onFocus={(e) => {
													e.currentTarget.style.outline = `2px solid ${token.colorPrimary}`;
													e.currentTarget.style.outlineOffset = '2px';
												}}
												onBlur={(e) => {
													e.currentTarget.style.outline = 'none';
												}}
												role="button"
												tabIndex={0}
												aria-label={`${deck.title} - ${t('cardsCount', { count: deck.cardCount })} - ${deck.dueCount > 0 ? t('dueCount', { count: deck.dueCount }) : t('noDue')}`}
											>
												<Flex vertical gap="small" style={{ flex: '1 1 200px', minWidth: 0 }}>
													<Flex align="center" gap="small" wrap="wrap">
														<Text
															strong
															ellipsis
															style={{
																fontSize: 'clamp(14px, 4vw, 16px)',
																color: token.colorPrimary,
																flex: '1 1 auto',
																minWidth: 0,
															}}
														>
															{deck.title}
														</Text>
														{isRecommended && (
															<Tag color="primary" style={{ fontSize: 11, flexShrink: 0 }}>
																{t('recommended')}
															</Tag>
														)}
													</Flex>
													<Flex gap="small" align="center" wrap="wrap">
														<Text type="secondary" style={{ fontSize: 13 }}>
															{t('cardsCount', { count: deck.cardCount })}
														</Text>
														{deck.dueCount > 0 ? (
															<Tag color="volcano" style={{ margin: 0, fontSize: 11 }}>
																{t('dueCount', { count: deck.dueCount })}
															</Tag>
														) : (
															<Tag color="success" style={{ margin: 0, fontSize: 11 }}>
																{t('noDue')}
															</Tag>
														)}
													</Flex>
												</Flex>
												<Button
													type={isRecommended ? 'primary' : 'default'}
													icon={<RocketOutlined />}
													style={{ flexShrink: 0, minHeight: 44 }}
													aria-label={`${t('startReview')} ${deck.title}`}
													onFocus={(e) => {
														e.currentTarget.style.outline = `2px solid ${token.colorPrimary}`;
														e.currentTarget.style.outlineOffset = '2px';
													}}
													onBlur={(e) => {
														e.currentTarget.style.outline = 'none';
													}}
												>
													{t('startReview')}
												</Button>
											</Flex>
										</Link>
									</motion.div>
								);
							})}
						</Flex>
					</>
				)}

				{/* Available Decks (Priority 2: No Due, But Has Cards) */}
				{groupedDecks.available.length > 0 && (
					<>
						{groupedDecks.actionable.length > 0 && <Divider style={{ margin: '16px 0' }} />}
						<Text
							strong
							style={{
								fontSize: 13,
								color: token.colorTextSecondary,
								marginBottom: 8,
								textTransform: 'uppercase',
								letterSpacing: 0.5,
							}}
						>
							{t('availableForLearning')}
						</Text>
						<Flex vertical gap="small">
							{groupedDecks.available.map((deck, index) => {
								// Safe null check for slug
								const studyUrl =
									deck.slug && deck.slug.trim() !== ''
										? `/study?deckSlug=${deck.slug}`
										: `/study?deckId=${deck.id}`;

								return (
									<motion.div
										key={deck.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: (groupedDecks.actionable.length + index) * 0.05 }}
									>
										<Link href={studyUrl} onClick={handleDeckSelect}>
											<Flex
												align="center"
												justify="space-between"
												wrap="wrap"
												style={{
													padding: '16px',
													borderRadius: 12,
													border: `1px solid ${token.colorBorderSecondary}`,
													background: token.colorBgContainer,
													cursor: 'pointer',
													transition: 'all 0.2s',
													gap: 12,
												}}
												onMouseEnter={(e) => {
													if (
														typeof window !== 'undefined' &&
														window.matchMedia('(hover: hover)').matches
													) {
														e.currentTarget.style.transform = 'translateY(-2px)';
														e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
													}
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.transform = 'translateY(0)';
													e.currentTarget.style.boxShadow = 'none';
												}}
												onFocus={(e) => {
													e.currentTarget.style.outline = `2px solid ${token.colorPrimary}`;
													e.currentTarget.style.outlineOffset = '2px';
												}}
												onBlur={(e) => {
													e.currentTarget.style.outline = 'none';
												}}
												role="button"
												tabIndex={0}
												aria-label={`${deck.title} - ${t('cardsCount', { count: deck.cardCount })} - ${t('noDue')}`}
											>
												<Flex vertical gap="small" style={{ flex: '1 1 200px', minWidth: 0 }}>
													<Flex align="center" gap="small" wrap="wrap">
														<Text
															strong
															ellipsis
															style={{
																fontSize: 'clamp(14px, 4vw, 16px)',
																color: token.colorPrimary,
																flex: '1 1 auto',
																minWidth: 0,
															}}
														>
															{deck.title}
														</Text>
													</Flex>
													<Flex gap="small" align="center" wrap="wrap">
														<Text type="secondary" style={{ fontSize: 13 }}>
															{t('cardsCount', { count: deck.cardCount })}
														</Text>
														<Tag color="success" style={{ margin: 0, fontSize: 11 }}>
															{t('noDue')}
														</Tag>
													</Flex>
												</Flex>
												<Button
													type="default"
													icon={<RocketOutlined />}
													style={{ flexShrink: 0, minHeight: 44 }}
													aria-label={`${t('startReview')} ${deck.title}`}
													onFocus={(e) => {
														e.currentTarget.style.outline = `2px solid ${token.colorPrimary}`;
														e.currentTarget.style.outlineOffset = '2px';
													}}
													onBlur={(e) => {
														e.currentTarget.style.outline = 'none';
													}}
												>
													{t('startReview')}
												</Button>
											</Flex>
										</Link>
									</motion.div>
								);
							})}
						</Flex>
					</>
				)}

				{/* View All Decks Link (if more decks available) */}
				{hasMore && (
					<>
						<Divider style={{ margin: '16px 0' }} />
						<Flex justify="center">
							<Link href="/dashboard/decks" onClick={handleDeckSelect}>
								<Button type="link" size="large" icon={<BookOutlined />}>
									{t('viewAllDecks')}
								</Button>
							</Link>
						</Flex>
					</>
				)}

				{/* Empty State */}
				{groupedDecks.actionable.length === 0 && groupedDecks.available.length === 0 && (
					<Flex vertical align="center" gap="middle" style={{ padding: '40px 20px' }}>
						<Text type="secondary" style={{ fontSize: 16 }}>
							{t('browseDecks')}
						</Text>
						<Link href="/decks">
							<Button type="primary" size="large" icon={<BookOutlined />}>
								{t('browseLibrary')}
							</Button>
						</Link>
					</Flex>
				)}
			</Flex>
		</Drawer>
	);
}
