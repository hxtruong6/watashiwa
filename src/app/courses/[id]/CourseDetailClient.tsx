'use client';

import { Typography, Button, Card, Tag, Timeline, Progress, Flex } from 'antd';
import {
	PlayCircleFilled,
	CheckCircleFilled,
	ClockCircleFilled,
	TrophyOutlined,
	PlusOutlined,
	ArrowLeftOutlined,
	DeleteOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
	LinkOutlined,
} from '@ant-design/icons';
import { Popconfirm, message, Empty } from 'antd';
import { removeDeckFromCourse, reorderDecks } from '@/services/course-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DeckSelector from './DeckSelector';

const { Title, Text, Paragraph } = Typography;

interface CourseDetailClientProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	course: any;
	isOwner: boolean;
}

export default function CourseDetailClient({ course, isOwner }: CourseDetailClientProps) {
	const t = useTranslations('Courses');
	const router = useRouter();
	const totalDecks = course.decks.length;

	// Calculate Overall Course Progress
	// Sum of all mastery / sum of all items
	const totalItems = course.decks.reduce(
		(acc: number, d: any) => acc + (d.deck.stats?.total || 0),
		0,
	);
	const totalMastered = course.decks.reduce(
		(acc: number, d: any) => acc + (d.deck.stats?.mastered || 0),
		0,
	);
	const overallProgress = totalItems > 0 ? Math.round((totalMastered / totalItems) * 100) : 0;

	const handleRemove = async (deckId: string) => {
		try {
			const res = await removeDeckFromCourse(course.id, deckId);
			if (res.success) {
				message.success('Deck removed');
				router.refresh();
			} else {
				message.error(res.error || 'Failed to remove');
			}
		} catch {
			message.error('Failed to remove');
		}
	};

	const handleMove = async (index: number, direction: 'up' | 'down') => {
		const newDecks = [...course.decks];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= newDecks.length) return;

		// Swap
		[newDecks[index], newDecks[targetIndex]] = [newDecks[targetIndex], newDecks[index]];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const newDeckIds = newDecks.map((d: any) => d.deckId);

		try {
			// Optimistic update could go here, but router.refresh() is safer for now
			await reorderDecks(course.id, newDeckIds);
			router.refresh();
		} catch {
			message.error('Failed to reorder');
		}
	};

	return (
		<div style={{ minHeight: '100vh', background: '#F9F7F2', paddingBottom: 80 }}>
			{/* 1. Immersive Hero Header */}
			<div
				style={{
					position: 'relative',
					background: course.headerImage
						? `url(${course.headerImage}) center/cover no-repeat`
						: '#1E3A5F',
					color: 'white',
					padding: '80px 24px 120px',
					textAlign: 'center',
				}}
			>
				{/* Overlay for readability */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
					}}
				/>

				<div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', zIndex: 1 }}>
					<div style={{ position: 'absolute', top: -40, left: 0 }}>
						<Link href="/dashboard/courses">
							<Button ghost icon={<ArrowLeftOutlined />} shape="circle" size="large" />
						</Link>
					</div>

					<Title
						level={1}
						style={{
							color: 'white',
							margin: '0 0 16px',
							fontSize: '2.5rem',
							fontWeight: 700,
							letterSpacing: '-0.02em',
						}}
					>
						{course.title}
					</Title>
					<Paragraph
						style={{
							color: 'rgba(255,255,255,0.9)',
							fontSize: '1.1rem',
							maxWidth: 600,
							margin: '0 auto 32px',
							lineHeight: 1.6,
						}}
					>
						{course.description || t('noDescription')}
					</Paragraph>

					{/* Overall Progress Badge */}
					<Card
						styles={{ body: { padding: '16px 24px' } }}
						style={{
							display: 'inline-block',
							borderRadius: 24,
							background: 'rgba(255,255,255,0.1)',
							backdropFilter: 'blur(10px)',
							border: '1px solid rgba(255,255,255,0.2)',
						}}
					>
						<Flex gap="large" align="center">
							<Flex vertical align="start">
								<Text
									style={{
										color: 'rgba(255,255,255,0.7)',
										fontSize: 12,
										textTransform: 'uppercase',
										letterSpacing: '0.05em',
									}}
								>
									Course Progress
								</Text>
								<Text strong style={{ color: 'white', fontSize: 24 }}>
									{overallProgress}%
								</Text>
							</Flex>
							<Progress
								type="circle"
								percent={overallProgress}
								width={50}
								strokeColor="#708238"
								trailColor="rgba(255,255,255,0.2)"
								format={() => <TrophyOutlined style={{ color: '#FAAD14' }} />}
							/>
						</Flex>
					</Card>

					{/* Start Course Button */}
					<div style={{ marginTop: 32 }}>
						{course.decks.length > 0 ? (
							<Link href={`/study?courseId=${course.id}`}>
								<Button
									type="primary"
									shape="round"
									size="large"
									icon={<PlayCircleFilled />}
									style={{ height: 48, padding: '0 32px', fontSize: 16 }}
								>
									Study Course
								</Button>
							</Link>
						) : (
							<Button
								type="primary"
								shape="round"
								size="large"
								icon={<PlayCircleFilled />}
								disabled // Visually disabled but we can also use onClick to show toast if preferred
								style={{
									height: 48,
									padding: '0 32px',
									fontSize: 16,
									opacity: 0.6,
									color: '#fefefea7',
								}}
								onClick={(e) => {
									e.preventDefault();
									message.warning(t('noDecksInCourse'));
								}}
							>
								Study Course
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* 2. Overlapping Card for Curriculum (The "Paper" effect) */}
			<div
				style={{
					maxWidth: 900,
					margin: '-60px auto 0',
					padding: '0 24px',
					position: 'relative',
					zIndex: 2,
				}}
			>
				<Card
					bordered={false}
					style={{ borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
					styles={{ body: { padding: '40px' } }}
				>
					<Flex justify="space-between" align="center" style={{ marginBottom: 40 }}>
						<div>
							<Title level={3} style={{ margin: 0, color: '#1E3A5F' }}>
								{t('learningPath')}
							</Title>
							<Text type="secondary">{t('decksCount', { count: totalDecks })} in sequence</Text>
						</div>
						{isOwner && (
							<DeckSelector
								courseId={course.id}
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								existingDeckIds={course.decks.map((d: any) => d.deckId)}
								onDeckAdded={() => router.refresh()}
								trigger={
									<Button type="dashed" icon={<PlusOutlined />} size="large" shape="round">
										{t('addDeck')}
									</Button>
								}
							/>
						)}
					</Flex>

					{totalDecks === 0 ? (
						<Empty description={t('emptyState')} />
					) : (
						/* 3. Timeline Viz */
						<Timeline
							mode="left"
							items={course.decks.map((cd: any, index: number) => {
								const progress = cd.deck.stats?.progress || 0;
								const isMastered = progress === 100;
								const isStarted = (cd.deck.stats?.started || 0) > 0;
								const isActive = isStarted && !isMastered;

								return {
									dot: isMastered ? (
										<CheckCircleFilled
											style={{ fontSize: 24, color: '#708238', background: 'white' }}
										/>
									) : isActive ? (
										<PlayCircleFilled
											style={{ fontSize: 24, color: '#1E3A5F', background: 'white' }}
										/>
									) : (
										<ClockCircleFilled
											style={{ fontSize: 24, color: '#d9d9d9', background: 'white' }}
										/>
									),
									children: (
										<div style={{ paddingBottom: 40 }}>
											<Card
												hoverable
												className="deck-card-hover"
												style={{
													borderRadius: 16,
													border: isStarted ? '1px solid #1E3A5F' : '1px solid #f0f0f0',
												}}
											>
												<Flex justify="space-between" align="start" gap="middle" wrap="wrap">
													<div style={{ flex: 1, minWidth: 200 }}>
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																gap: 8,
																marginBottom: 8,
															}}
														>
															<Tag color="geekblue">{t('unit', { index: index + 1 })}</Tag>
															{cd.deck.isPublic ? (
																<Tag variant="outlined">{t('publicDeck')}</Tag>
															) : (
																<Tag color="orange" variant="outlined">
																	{t('privateDeck')}
																</Tag>
															)}
															<Link href={`/decks/${cd.deckId}`} target="_blank">
																<LinkOutlined style={{ color: '#1890ff' }} />
															</Link>
														</div>

														<Title level={4} style={{ margin: 0, marginBottom: 4 }}>
															{cd.deck.title}
														</Title>
														<Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
															{cd.deck.description || t('noDescription')}
														</Text>

														<div
															style={{
																display: 'flex',
																gap: 16,
																fontSize: 13,
																color: '#666',
															}}
														>
															<span>
																{t('by')} {cd.deck.author.name}
															</span>
															<Tag style={{ margin: 0 }}>
																{cd.deck._count.vocab} {t('items')}
															</Tag>
														</div>
													</div>

													<div style={{ marginLeft: 24, textAlign: 'right', minWidth: 120 }}>
														{isMastered ? (
															<div style={{ color: '#52c41a', textAlign: 'center' }}>
																<CheckCircleFilled style={{ fontSize: 24, marginBottom: 4 }} />
																<div>
																	<Text type="success" strong>
																		{Math.round(progress)}%
																	</Text>
																</div>
																<Text type="secondary" style={{ fontSize: 12 }}>
																	{t('mastered')}
																</Text>
															</div>
														) : (
															<div style={{ width: 120 }}>
																<div style={{ marginBottom: 8, textAlign: 'right' }}>
																	<Text strong>{Math.round(progress)}%</Text>
																</div>
																<Progress
																	percent={progress}
																	showInfo={false}
																	size="small"
																	status="active"
																/>
																<div style={{ marginTop: 12 }}>
																	<Link href={`/decks/${cd.deckId}`}>
																		<Button
																			type="primary"
																			shape="round"
																			icon={<PlayCircleFilled />}
																			style={{ width: '100%' }}
																		>
																			{isStarted ? t('continue') : t('start')}
																		</Button>
																	</Link>
																</div>
															</div>
														)}

														{/* Owner Controls */}
														{isOwner && (
															<div
																style={{
																	marginTop: 16,
																	display: 'flex',
																	justifyContent: 'flex-end',
																	gap: 8,
																}}
															>
																<Button
																	size="small"
																	icon={<ArrowUpOutlined />}
																	disabled={index === 0}
																	onClick={() => handleMove(index, 'up')}
																/>
																<Button
																	size="small"
																	icon={<ArrowDownOutlined />}
																	disabled={index === totalDecks - 1}
																	onClick={() => handleMove(index, 'down')}
																/>
																<Popconfirm
																	title="Remove this deck?"
																	onConfirm={() => handleRemove(cd.deckId)}
																	okText="Yes"
																	cancelText="No"
																>
																	<Button size="small" danger icon={<DeleteOutlined />} />
																</Popconfirm>
															</div>
														)}
													</div>
												</Flex>
											</Card>
										</div>
									),
								};
							})}
						/>
					)}
				</Card>
			</div>
		</div>
	);
}
