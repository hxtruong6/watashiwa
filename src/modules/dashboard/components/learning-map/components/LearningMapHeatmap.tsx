'use client';

/**
 * Enhanced Heatmap Variant
 *
 * Shows learning activity as a heatmap grid with:
 * - Pattern detection (streaks, gaps, clusters)
 * - Insight annotations
 * - Rich tooltips with context
 * - Summary statistics
 * - Visual indicators for different states
 */

import { Badge, Card, Flex, Segmented, Tag, Tooltip, Typography, theme } from 'antd';
import React, { useMemo, useState } from 'react';

import type { LearningMapData, LearningMapNode } from '../types';

const { Text, Title } = Typography;
const { useToken } = theme;

interface LearningMapHeatmapProps {
	data: LearningMapData | null;
	onNodeClick?: (node: LearningMapNode) => void;
	height?: number;
}

interface CellData {
	wordId: string;
	intensity: number;
	reviewsOnDay: number;
	isReviewDay: boolean;
	stability: number;
	rating?: number;
}

interface WordInsight {
	wordId: string;
	word: LearningMapNode;
	type: 'streak' | 'gap' | 'leech' | 'mastered' | 'needs-review';
	message: string;
	severity: 'info' | 'warning' | 'error' | 'success';
}

export default function LearningMapHeatmap({
	data,
	onNodeClick,
	height = 600,
}: LearningMapHeatmapProps) {
	const { token } = useToken();
	const [hoveredCell, setHoveredCell] = useState<{ day: number; wordIdx: number } | null>(null);
	const [filter, setFilter] = useState<'all' | 'leeches' | 'mastered' | 'needs-review'>('all');

	const { heatmapData, insights, stats } = useMemo(() => {
		if (!data || !data.nodes.length) return { heatmapData: null, insights: [], stats: null };

		// Create a grid: days x words
		const days = Math.ceil(
			(data.dateRange.end.getTime() - data.dateRange.start.getTime()) /
				(24 * 60 * 60 * 1000),
		);
		const words = data.nodes;

		// For each word, calculate activity per day
		const grid: Array<Array<CellData>> = [];

		for (let day = 0; day < days; day++) {
			const dayDate = new Date(
				data.dateRange.start.getTime() + day * 24 * 60 * 60 * 1000,
			);
			const dayColumn: Array<CellData> = [];

			for (const word of words) {
				// Check if word was reviewed on this day
				const reviewsOnDay = data.timeline.filter(
					(point) =>
						point.wordId === word.id &&
						point.date.toDateString() === dayDate.toDateString(),
				);

				const isReviewDay = reviewsOnDay.length > 0;
				const latestReview = reviewsOnDay[reviewsOnDay.length - 1];
				const stability = latestReview?.stability || word.stability;

				// Calculate intensity based on reviews and stability
				const intensity = Math.min(
					1.0,
					reviewsOnDay.length * 0.4 + (stability > 0 ? Math.min(stability / 100, 0.6) : 0),
				);

				dayColumn.push({
					wordId: word.id,
					intensity,
					reviewsOnDay: reviewsOnDay.length,
					isReviewDay,
					stability,
					rating: latestReview?.rating,
				});
			}

			grid.push(dayColumn);
		}

		// Generate insights
		const insights: WordInsight[] = [];

		for (const word of words) {
			// Find word's review pattern
			const wordReviews = data.timeline.filter((p) => p.wordId === word.id);
			const reviewDays = wordReviews.map((r) =>
				Math.floor(
					(r.date.getTime() - data.dateRange.start.getTime()) /
						(24 * 60 * 60 * 1000),
				),
			);

			// Detect streaks (consecutive days with reviews)
			let currentStreak = 0;
			let maxStreak = 0;
			for (let i = 0; i < reviewDays.length - 1; i++) {
				if (reviewDays[i + 1] - reviewDays[i] === 1) {
					currentStreak++;
					maxStreak = Math.max(maxStreak, currentStreak);
				} else {
					currentStreak = 0;
				}
			}

			// Detect gaps (long periods without review)
			const now = Math.floor(
				(data.dateRange.end.getTime() - data.dateRange.start.getTime()) /
					(24 * 60 * 60 * 1000),
			);
			const daysSinceLastReview = reviewDays.length > 0 ? now - reviewDays[reviewDays.length - 1] : now;
			const expectedReview = word.stability > 0 ? Math.floor(word.stability) : 7;
			const isOverdue = daysSinceLastReview > expectedReview * 1.5;

			// Generate insights
			if (word.isLeech) {
				insights.push({
					wordId: word.id,
					word,
					type: 'leech',
					message: `Leech: ${word.lapses} failures. Needs focused practice.`,
					severity: 'error',
				});
			} else if (word.stability > 21) {
				insights.push({
					wordId: word.id,
					word,
					type: 'mastered',
					message: `Mastered: ${Math.floor(word.stability)} days stability. Great progress!`,
					severity: 'success',
				});
			} else if (isOverdue && word.stability > 0) {
				insights.push({
					wordId: word.id,
					word,
					type: 'needs-review',
					message: `Overdue: ${daysSinceLastReview} days since last review (expected ${expectedReview} days)`,
					severity: 'warning',
				});
			} else if (maxStreak >= 3) {
				insights.push({
					wordId: word.id,
					word,
					type: 'streak',
					message: `${maxStreak}-day review streak! Consistent practice.`,
					severity: 'success',
				});
			} else if (daysSinceLastReview > 14 && word.stability > 0) {
				insights.push({
					wordId: word.id,
					word,
					type: 'gap',
					message: `Gap: ${daysSinceLastReview} days without review. Time to refresh.`,
					severity: 'warning',
				});
			}
		}

		// Calculate statistics
		const totalReviews = data.timeline.length;
		const activeDays = new Set(
			data.timeline.map((p) =>
				Math.floor(
					(p.date.getTime() - data.dateRange.start.getTime()) /
						(24 * 60 * 60 * 1000),
				),
			),
		).size;
		const leechCount = words.filter((w) => w.isLeech).length;
		const masteredCount = words.filter((w) => w.stability > 21).length;
		const avgStability = words.reduce((sum, w) => sum + w.stability, 0) / words.length;

		const stats = {
			totalReviews,
			activeDays,
			leechCount,
			masteredCount,
			avgStability: Math.round(avgStability * 10) / 10,
			totalWords: words.length,
		};

		// Filter words based on selected filter
		let filteredWords = words;
		if (filter === 'leeches') {
			filteredWords = words.filter((w) => w.isLeech);
		} else if (filter === 'mastered') {
			filteredWords = words.filter((w) => w.stability > 21);
		} else if (filter === 'needs-review') {
			filteredWords = words.filter((w) => {
				const wordReviews = data.timeline.filter((p) => p.wordId === w.id);
				if (wordReviews.length === 0) return false;
				const lastReviewDay = Math.floor(
					(wordReviews[wordReviews.length - 1].date.getTime() -
						data.dateRange.start.getTime()) /
						(24 * 60 * 60 * 1000),
				);
				const now = Math.floor(
					(data.dateRange.end.getTime() - data.dateRange.start.getTime()) /
						(24 * 60 * 60 * 1000),
				);
				const daysSince = now - lastReviewDay;
				const expected = w.stability > 0 ? Math.floor(w.stability) : 7;
				return daysSince > expected * 1.5;
			});
		}

		// Rebuild grid with filtered words
		const filteredGrid: Array<Array<CellData>> = [];
		for (let day = 0; day < days; day++) {
			const dayColumn: Array<CellData> = [];
			for (const word of filteredWords) {
				const originalWordIdx = words.indexOf(word);
				dayColumn.push(grid[day][originalWordIdx]);
			}
			filteredGrid.push(dayColumn);
		}

		return {
			heatmapData: {
				grid: filteredGrid,
				days,
				words: filteredWords,
			},
			insights: insights.filter((i) => filteredWords.some((w) => w.id === i.wordId)),
			stats,
		};
	}, [data, filter]);

	if (!data || data.nodes.length === 0) {
		return (
			<Card>
				<Text type="secondary">No learning data available yet.</Text>
			</Card>
		);
	}

	if (!heatmapData) {
		return (
			<Card>
				<Text type="secondary">Processing heatmap data...</Text>
			</Card>
		);
	}

	const cellWidth = Math.max(6, Math.floor(800 / heatmapData.days));
	const cellHeight = Math.max(16, Math.floor((height - 200) / heatmapData.words.length));

	const getCellColor = (cell: CellData, word: LearningMapNode): string => {
		if (word.isLeech) {
			// Red for leeches, intensity based on review activity
			return cell.isReviewDay ? token.colorError : token.colorErrorBg;
		}
		if (word.stability > 21) {
			// Green for mastered, intensity based on activity
			return cell.isReviewDay ? token.colorSuccess : token.colorSuccessBg;
		}
		// Blue for learning, intensity based on activity
		return cell.isReviewDay ? token.colorPrimary : token.colorPrimaryBg;
	};

	const getCellOpacity = (cell: CellData): number => {
		if (cell.isReviewDay) {
			return Math.max(0.6, cell.intensity);
		}
		return Math.max(0.1, cell.intensity * 0.3);
	};

	return (
		<div
			style={{
				height,
				position: 'relative',
				background: token.colorBgContainer,
				borderRadius: token.borderRadius,
				padding: 16,
			}}
		>
			<Flex vertical gap={16}>
				{/* Header with Stats */}
				<Flex justify="space-between" align="start" wrap="wrap">
					<div>
						<Title level={4} style={{ margin: 0, marginBottom: 8 }}>
							Learning Activity Heatmap
						</Title>
						<Text type="secondary" style={{ fontSize: 13 }}>
							Track your learning journey over time. Each cell represents a word on a specific day.
						</Text>
					</div>
					{stats && (
						<Flex gap={16} wrap="wrap">
							<Flex vertical align="center">
								<Text type="secondary" style={{ fontSize: 11 }}>
									Total Reviews
								</Text>
								<Text strong style={{ fontSize: 18 }}>
									{stats.totalReviews}
								</Text>
							</Flex>
							<Flex vertical align="center">
								<Text type="secondary" style={{ fontSize: 11 }}>
									Active Days
								</Text>
								<Text strong style={{ fontSize: 18 }}>
									{stats.activeDays}
								</Text>
							</Flex>
							<Flex vertical align="center">
								<Text type="secondary" style={{ fontSize: 11 }}>
									Avg Stability
								</Text>
								<Text strong style={{ fontSize: 18 }}>
									{stats.avgStability}d
								</Text>
							</Flex>
						</Flex>
					)}
				</Flex>

				{/* Filter Controls */}
				<Flex justify="space-between" align="center" wrap="wrap" gap={8}>
					<Segmented
						options={[
							{ label: 'All Words', value: 'all' },
							{ label: `Leeches (${stats?.leechCount || 0})`, value: 'leeches' },
							{ label: `Mastered (${stats?.masteredCount || 0})`, value: 'mastered' },
							{ label: 'Needs Review', value: 'needs-review' },
						]}
						value={filter}
						onChange={(value) => setFilter(value as typeof filter)}
					/>
					<Flex gap={8}>
						<Tag color="success">Green = Mastered</Tag>
						<Tag color="processing">Blue = Learning</Tag>
						<Tag color="error">Red = Leech</Tag>
					</Flex>
				</Flex>

				{/* Insights Panel */}
				{insights.length > 0 && (
					<Card size="small" style={{ background: token.colorInfoBg }}>
						<Flex vertical gap={8}>
							<Text strong style={{ fontSize: 13 }}>
								💡 Key Insights
							</Text>
							<Flex vertical gap={4}>
								{insights.slice(0, 5).map((insight, idx) => (
									<Flex key={idx} gap={8} align="center">
										<Badge
											status={
												insight.severity === 'error'
													? 'error'
													: insight.severity === 'warning'
														? 'warning'
														: 'success'
											}
										/>
										<Text
											style={{
												fontSize: 12,
												cursor: 'pointer',
												color:
													insight.severity === 'error'
														? token.colorError
														: insight.severity === 'warning'
															? token.colorWarning
															: token.colorSuccess,
											}}
											onClick={() => onNodeClick?.(insight.word)}
										>
											<strong>{insight.word.wordSurface}</strong>: {insight.message}
										</Text>
									</Flex>
								))}
							</Flex>
						</Flex>
					</Card>
				)}

				{/* Heatmap Grid */}
				<div
					style={{
						position: 'relative',
						width: '100%',
						height: height - 300,
						overflow: 'auto',
						border: `1px solid ${token.colorBorder}`,
						borderRadius: token.borderRadius,
						padding: 8,
					}}
				>
					<div style={{ display: 'flex', gap: 2 }}>
						{/* Y-axis labels */}
						<div style={{ width: 120, flexShrink: 0 }}>
							{heatmapData.words.map((word, idx) => {
								const wordInsights = insights.filter((i) => i.wordId === word.id);
								return (
									<Tooltip
										key={word.id}
										title={
											<div>
												<div style={{ fontWeight: 600, marginBottom: 4 }}>
													{word.wordSurface} - {word.meaning}
												</div>
												<div style={{ fontSize: 12 }}>
													<div>Stability: {word.stability.toFixed(1)} days</div>
													<div>Reviews: {word.reviewCount}</div>
													<div>Learned: {word.learnedAt.toLocaleDateString()}</div>
													{word.isLeech && (
														<div style={{ color: token.colorError }}>
															⚠️ Leech ({word.lapses} failures)
														</div>
													)}
												</div>
											</div>
										}
									>
										<div
											style={{
												height: cellHeight,
												display: 'flex',
												alignItems: 'center',
												gap: 4,
												fontSize: 11,
												color: token.colorText,
												cursor: 'pointer',
											}}
											onClick={() => onNodeClick?.(word)}
										>
											{wordInsights.length > 0 && (
												<Badge
													status={
														wordInsights[0].severity === 'error'
															? 'error'
															: wordInsights[0].severity === 'warning'
																? 'warning'
																: 'success'
													}
												/>
											)}
											<span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{word.wordSurface}
											</span>
										</div>
									</Tooltip>
								);
							})}
						</div>

						{/* Heatmap grid */}
						<div style={{ display: 'flex', gap: 1 }}>
							{heatmapData.grid.map((dayColumn, dayIdx) => {
								const dayDate = new Date(
									data.dateRange.start.getTime() + dayIdx * 24 * 60 * 60 * 1000,
								);
								const isToday =
									dayDate.toDateString() === new Date().toDateString();
								const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

								return (
									<div
										key={dayIdx}
										style={{
											display: 'flex',
											flexDirection: 'column',
											gap: 1,
											position: 'relative',
										}}
									>
										{/* Day label (top) */}
										{dayIdx % 7 === 0 && (
											<div
												style={{
													height: 20,
													fontSize: 9,
													color: token.colorTextSecondary,
													textAlign: 'center',
													writingMode: 'vertical-rl',
													transform: 'rotate(180deg)',
												}}
											>
												{dayDate.toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
												})}
											</div>
										)}
										{dayColumn.map((cell, wordIdx) => {
											const word = heatmapData.words[wordIdx];
											const isHovered =
												hoveredCell?.day === dayIdx && hoveredCell?.wordIdx === wordIdx;

											return (
												<Tooltip
													key={`${dayIdx}-${wordIdx}`}
													title={
														<div>
															<div style={{ fontWeight: 600, marginBottom: 4 }}>
																{word.wordSurface} - {dayDate.toLocaleDateString()}
															</div>
															{cell.isReviewDay ? (
																<div style={{ fontSize: 12 }}>
																	<div>✓ Reviewed {cell.reviewsOnDay}x</div>
																	{cell.rating && (
																		<div>
																			Rating:{' '}
																			{cell.rating === 1
																				? 'Again'
																				: cell.rating === 2
																					? 'Hard'
																					: cell.rating === 3
																						? 'Good'
																						: 'Easy'}
																		</div>
																	)}
																	<div>Stability: {cell.stability.toFixed(1)} days</div>
																</div>
															) : (
																<div style={{ fontSize: 12, color: token.colorTextSecondary }}>
																	No review on this day
																</div>
															)}
														</div>
													}
												>
													<div
														key={`${dayIdx}-${wordIdx}`}
														onClick={() => onNodeClick?.(word)}
														onMouseEnter={() => setHoveredCell({ day: dayIdx, wordIdx })}
														onMouseLeave={() => setHoveredCell(null)}
														style={{
															width: cellWidth,
															height: cellHeight,
															background: getCellColor(cell, word),
															opacity: getCellOpacity(cell),
															cursor: 'pointer',
															borderRadius: 2,
															border: isHovered
																? `2px solid ${token.colorPrimary}`
																: isToday
																	? `1px solid ${token.colorWarning}`
																	: 'none',
															boxShadow: isHovered
																? `0 0 4px ${token.colorPrimary}`
																: 'none',
															transition: 'all 0.2s',
														}}
													/>
												</Tooltip>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</Flex>
		</div>
	);
}
