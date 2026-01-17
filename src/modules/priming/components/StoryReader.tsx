/**
 * StoryReader Component
 *
 * Main container for Contextual Story Reader
 * Orchestrates WordPill, SmartTooltip, and CollectionDrawer
 */

'use client';

import { trackEvent } from '@/lib/analytics';
import { TranslationOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Popover, Segmented, Space, Spin, Typography, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { completeStoryAction, updateStoryProgressAction } from '../actions';
import { useAutoSaveProgress, useStoryProgress } from '../hooks/useStoryProgress';
import { useTextSegmentation } from '../hooks/useTextSegmentation';
import { useWordCollection } from '../hooks/useWordCollection';
import { StoryWithVocabularies, VocabMeta } from '../types';
import { playCollectionSound, triggerHaptic } from '../utils/animationHelpers';
import { CollectionDrawer } from './CollectionDrawer';
import { GhostAnimation } from './GhostAnimation';
import { VocabPopoverContent } from './VocabPopoverContent';
import { WordPill } from './WordPill';

const { Title, Text, Paragraph } = Typography;

interface StoryReaderProps {
	story: StoryWithVocabularies;
	locale?: 'en' | 'vi' | 'ja';
	userLanguage?: 'en' | 'vi'; // User's global language preference (for translation fallback when story is 'ja')
	onComplete?: () => void;
	redirectOnComplete?: string; // URL to redirect to after completion (for Server Component usage)
}

export function StoryReader({
	story,
	locale = 'en',
	userLanguage = 'en', // Default to 'en' if not provided
	onComplete,
	redirectOnComplete,
}: StoryReaderProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// State management
	const [showTranslation, setShowTranslation] = useState(false);
	const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
	const [activeTooltip, setActiveTooltip] = useState<{
		vocab: VocabMeta | null;
		vocabularyId: string | null;
	}>({
		vocab: null,
		vocabularyId: null,
	});
	const [hoveredVocabId, setHoveredVocabId] = useState<string | null>(null);
	const [isCompleting, setIsCompleting] = useState(false);
	const [ghostAnimations, setGhostAnimations] = useState<
		Array<{
			id: string;
			wordElement: HTMLElement;
			wordText: string;
			vocabularyId: string;
			targetSlotIndex: number;
		}>
	>([]);
	const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
	const drawerRef = useRef<HTMLDivElement | null>(null);

	// Zustand store
	const startReading = useStoryProgress((state) => state.startReading);
	const toggleTranslation = useStoryProgress((state) => state.toggleTranslation);
	const getAnalytics = useStoryProgress((state) => state.getAnalytics);
	const readTimeSeconds = useStoryProgress((state) => state.readTimeSeconds);
	const collectedWords = useStoryProgress((state) => state.collectedWords);
	const resetProgress = useStoryProgress((state) => state.resetProgress);

	// Hooks
	const { segments, translation, translationSegments, vocabMapping, metadata } =
		useTextSegmentation({ story, locale, userLanguage });
	const { handleWordClick, handleAudioPlay, isWordCollected, isStoryComplete, getProgress } =
		useWordCollection({
			storyId: story.id,
			onWordCollected: (vocabularyId, totalCollected) => {
				// Play feedback
				playCollectionSound();
				triggerHaptic('light');

				// Expand drawer after first collection
				if (totalCollected === 1) {
					setIsDrawerExpanded(true);
				}

				// Announce to screen reader
				const vocabMeta = story.vocabularies.find((v) => v.vocabularyId === vocabularyId);
				const wordText = vocabMeta?.wordSurface || 'word';
				const { total } = getProgress();
				setScreenReaderAnnouncement(
					`Word collected: ${wordText}. Progress: ${totalCollected} of ${total} words.`,
				);
			},
		});

	// Initialize reading session
	useEffect(() => {
		startReading(story.id, metadata.totalWords);

		// Track start event
		trackEvent('story_started', {
			story_id: story.id,
			language: locale,
		});

		// Cleanup on unmount (pause reading)
		return () => {
			// Get current read time from store to avoid stale closure
			const currentReadTime = useStoryProgress.getState().readTimeSeconds;
			trackEvent('story_paused', {
				story_id: story.id,
				paused_at: currentReadTime,
			});
		};
	}, [story.id, metadata.totalWords, locale, startReading]);

	// Auto-save progress every 30 seconds
	useAutoSaveProgress(story.id, async (analytics, readTime, wordsCollected) => {
		await updateStoryProgressAction({
			storyId: story.id,
			wordsCollected,
			readTimeSeconds: readTime,
			analytics,
		});
	});

	// Handle word click
	const onWordClick = useCallback(
		(event: React.MouseEvent, vocabularyId: string) => {
			const wordElement = event.currentTarget as HTMLElement;
			const vocabMeta = story.vocabularies.find((v) => v.vocabularyId === vocabularyId);

			if (!vocabMeta) {
				console.error('Vocabulary not found:', vocabularyId);
				return;
			}

			// Extract VocabMeta from vocabulary
			const meanings = vocabMeta.vocabulary.meanings as Record<string, string[]>;
			const meta: VocabMeta = {
				vocabularyId: vocabMeta.vocabularyId,
				wordSurface: vocabMeta.wordSurface,
				wordReading: vocabMeta.wordReading,
				meaningEn: meanings.en?.[0] || meanings.english?.[0] || 'No meaning',
				meaningVi: meanings.vi?.[0] || meanings.vietnamese?.[0] || 'Không có nghĩa',
				hanViet: vocabMeta.vocabulary.hanViet,
				audioUrl: vocabMeta.vocabulary.audioUrl,
				positions: vocabMeta.positions,
			};

			// Handle click
			const result = handleWordClick(vocabularyId, meta.wordSurface);

			if (!result.alreadyCollected) {
				// Open tooltip
				setActiveTooltip({ vocab: meta, vocabularyId });

				// Trigger ghost animation if drawer is available
				// The word is now in collectedWords (Zustand store), so we can find its index
				// in collectedWordsList which maintains story order
				if (drawerRef.current && result.collected) {
					// Find the word's position in the story vocabularies (maintains story order)
					// This will be its position in collectedWordsList after the next render
					const storyIndex = story.vocabularies.findIndex((v) => v.vocabularyId === vocabularyId);
					// Count how many words before this one in story order have been collected
					// Note: We need to include the current word in the count since it's now collected
					const collectedBefore = story.vocabularies
						.slice(0, storyIndex + 1)
						.filter((v) => collectedWords.has(v.vocabularyId)).length;
					// Target slot is the position in the collected words list (which maintains story order)
					// Subtract 1 because we want 0-based index
					const targetSlotIndex = collectedBefore - 1;

					setGhostAnimations((prev) => [
						...prev,
						{
							id: `${vocabularyId}-${Date.now()}`,
							wordElement,
							wordText: meta.wordSurface,
							vocabularyId,
							targetSlotIndex,
						},
					]);
				}
			}
		},
		[story.vocabularies, handleWordClick, collectedWords],
	);

	// Handle tooltip open
	const handleOpenTooltip = useCallback((vocab: VocabMeta) => {
		setActiveTooltip({ vocab, vocabularyId: vocab.vocabularyId });
	}, []);

	// Handle tooltip close
	const handleCloseTooltip = useCallback(() => {
		setActiveTooltip({ vocab: null, vocabularyId: null });
	}, []);

	// Handle ghost animation complete
	const handleGhostComplete = useCallback(
		(id: string) => () => {
			setGhostAnimations((prev) => prev.filter((g) => g.id !== id));
		},
		[],
	);

	// Toggle drawer
	const handleToggleDrawer = useCallback(() => {
		setIsDrawerExpanded((prev) => !prev);
	}, []);

	// Toggle translation
	const onToggleTranslation = useCallback(() => {
		const newState = !showTranslation;
		setShowTranslation(newState);
		toggleTranslation(newState);

		trackEvent('translation_toggled', {
			story_id: story.id,
			shown: newState,
		});
	}, [showTranslation, story.id, toggleTranslation]);

	// Handle language change (story-level only, does NOT update global language preference)
	const handleLanguageChange = useCallback(
		(newLocale: 'en' | 'vi' | 'ja') => {
			if (newLocale === locale) return;

			// Get current pathname to extract slug
			const pathname = window.location.pathname;
			const slug = pathname.split('/stories/')[1]?.split('?')[0] || '';

			// Update URL with new locale (this will trigger a re-render with new locale)
			const params = new URLSearchParams(searchParams.toString());
			params.set('locale', newLocale);
			router.push(`/stories/${slug}?${params.toString()}`);

			// Note: We do NOT update global language preference here
			// Story language selector is independent of app language setting
		},
		[locale, searchParams, router],
	);

	// Handle word hover (for bidirectional highlighting)
	const handleWordHover = useCallback((vocabularyId: string | null) => {
		setHoveredVocabId(vocabularyId);
	}, []);

	// Complete story
	const onCompleteStory = useCallback(async () => {
		if (!isStoryComplete()) {
			console.warn('Story not complete yet');
			return;
		}

		setIsCompleting(true);

		try {
			const analytics = getAnalytics();
			const { total } = getProgress();

			const result = await completeStoryAction({
				storyId: story.id,
				totalWords: total,
				readTimeSeconds,
				analytics,
			});

			if (result.success) {
				// Show success message
				console.log('✅ Story completed! New flashcards:', result.data?.newCardsAdded);

				// Announce completion to screen reader
				setScreenReaderAnnouncement('Story complete! All words collected.');

				// Reset progress
				resetProgress();

				// Handle completion callback or redirect
				if (redirectOnComplete) {
					router.push(redirectOnComplete);
				} else {
					onComplete?.();
				}
			} else {
				console.error('Failed to complete story:', result.error);
				message.error('Failed to complete story. Please try again.');
			}
		} catch (error) {
			console.error('Error completing story:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'An error occurred. Please try again.';
			message.error(errorMessage);
		} finally {
			setIsCompleting(false);
		}
	}, [
		isStoryComplete,
		getAnalytics,
		getProgress,
		story.id,
		readTimeSeconds,
		resetProgress,
		onComplete,
		redirectOnComplete,
		router,
	]);

	// Build collected words list for drawer (memoized for performance)
	const collectedWordsList: VocabMeta[] = useMemo(
		() =>
			story.vocabularies
				.filter((v) => collectedWords.has(v.vocabularyId))
				.map((v) => {
					const meanings = v.vocabulary.meanings as Record<string, string[]>;
					return {
						vocabularyId: v.vocabularyId,
						wordSurface: v.wordSurface,
						wordReading: v.wordReading,
						meaningEn: meanings.en?.[0] || meanings.english?.[0] || 'No meaning',
						meaningVi: meanings.vi?.[0] || meanings.vietnamese?.[0] || 'Không có nghĩa',
						hanViet: v.vocabulary.hanViet,
						audioUrl: v.vocabulary.audioUrl,
						positions: v.positions,
					};
				}),
		[story.vocabularies, collectedWords],
	);

	return (
		<div
			style={{
				position: 'relative',
				maxWidth: '800px',
				margin: '0 auto',
				paddingBottom: '120px', // Space for drawer
			}}
		>
			{/* Story Header */}
			<Card
				variant="borderless"
				style={{
					marginBottom: '24px',
					borderRadius: '16px',
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
				}}
			>
				<Space orientation="vertical" size={8} style={{ width: '100%' }}>
					<Title level={2} style={{ margin: 0 }}>
						{metadata.title}
					</Title>
					<Space size={8}>
						<Text type="secondary">
							{metadata.difficulty} • {metadata.category}
						</Text>
						<Text type="secondary">• {metadata.readTimeMin} min read</Text>
					</Space>
				</Space>
			</Card>

			{/* Instructions Alert */}
			<Alert
				title="How to Read"
				description="Click on highlighted words to learn their meaning and collect them! Complete the story by collecting all words."
				type="info"
				showIcon
				closable
				style={{ marginBottom: '24px' }}
			/>

			{/* Language Selector and Translation Toggle */}
			<Space size={16} style={{ marginBottom: '16px' }}>
				<Segmented
					options={[
						{ label: 'English', value: 'en' },
						{ label: 'Tiếng Việt', value: 'vi' },
						{ label: '日本語', value: 'ja' },
					]}
					value={locale}
					onChange={(value) => handleLanguageChange(value as 'en' | 'vi' | 'ja')}
					size="large"
				/>
				<Button
					icon={<TranslationOutlined />}
					onClick={onToggleTranslation}
					type={showTranslation ? 'primary' : 'default'}
				>
					{showTranslation ? 'Hide' : 'Show'} Translation
				</Button>
			</Space>

			{/* Story Content */}
			<Card
				variant="borderless"
				style={{
					borderRadius: '16px',
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
					marginBottom: '24px',
					backdropFilter: activeTooltip.vocab ? 'blur(3px)' : 'none',
					transition: 'backdrop-filter 300ms ease',
				}}
			>
				<Paragraph
					style={{
						fontSize: '18px',
						lineHeight: '1.8',
						color: '#333',
						whiteSpace: 'pre-wrap',
					}}
				>
					{segments.map((segment, index) => {
						if (segment.type === 'text') {
							return <span key={index}>{segment.content}</span>;
						} else {
							const isCollected = isWordCollected(segment.meta.vocabularyId);
							const isHovered = hoveredVocabId === segment.meta.vocabularyId;
							const mapping = vocabMapping.get(segment.meta.vocabularyId);
							const hasTranslation = mapping && mapping.translationIndices.length > 0;

							const isTooltipOpen = activeTooltip.vocabularyId === segment.meta.vocabularyId;

							return (
								<span
									key={index}
									onMouseEnter={() => handleWordHover(segment.meta.vocabularyId)}
									onMouseLeave={() => handleWordHover(null)}
									style={{
										position: 'relative',
										display: 'inline-block',
									}}
								>
									<Popover
										content={
											<VocabPopoverContent
												vocab={segment.meta}
												isCollected={isCollected}
												onAudioPlay={handleAudioPlay}
												autoPlayAudio={true}
											/>
										}
										trigger="click"
										open={isTooltipOpen}
										onOpenChange={(open) => {
											if (open) {
												handleOpenTooltip(segment.meta);
											} else {
												handleCloseTooltip();
											}
										}}
										placement="top"
										autoAdjustOverflow
										destroyTooltipOnHide
										styles={{
											content: {
												width: 320,
												minWidth: 320,
												maxWidth: 320,
											},
										}}
									>
										<span style={{ display: 'inline-block' }}>
											<WordPill
												vocab={segment.meta}
												isCollected={isCollected}
												onClick={onWordClick}
											/>
										</span>
									</Popover>
									{isHovered && hasTranslation && (
										<span
											style={{
												position: 'absolute',
												top: '-2px',
												left: '-2px',
												right: '-2px',
												bottom: '-2px',
												border: '2px solid rgba(108, 99, 255, 0.5)',
												borderRadius: '4px',
												pointerEvents: 'none',
												transition: 'all 0.2s ease',
											}}
										/>
									)}
								</span>
							);
						}
					})}
				</Paragraph>

				{/* Translation (if shown) */}
				{showTranslation && (
					<div
						style={{
							marginTop: '32px',
							paddingTop: '24px',
							borderTop: '2px solid rgba(0, 0, 0, 0.06)',
						}}
					>
						<Text
							strong
							style={{ fontSize: '14px', display: 'block', marginBottom: '12px', color: '#999' }}
						>
							Translation:
						</Text>
						<Paragraph
							style={{
								fontSize: '16px',
								lineHeight: '1.6',
								color: '#666',
								fontStyle: 'italic',
							}}
						>
							{translationSegments.length > 0
								? translationSegments.map((segment, index) => {
										if (segment.type === 'text') {
											return <span key={index}>{segment.content}</span>;
										} else {
											const isHovered = hoveredVocabId === segment.vocabId;
											const mapping = segment.vocabId
												? vocabMapping.get(segment.vocabId)
												: undefined;
											const hasStoryWord = mapping && mapping.storyIndices.length > 0;

											return (
												<span
													key={index}
													onMouseEnter={() => segment.vocabId && handleWordHover(segment.vocabId)}
													onMouseLeave={() => handleWordHover(null)}
													style={{
														backgroundColor: isHovered
															? 'rgba(108, 99, 255, 0.2)'
															: hasStoryWord
																? 'rgba(108, 99, 255, 0.1)'
																: 'transparent',
														padding: '2px 4px',
														borderRadius: '4px',
														fontWeight: hasStoryWord ? 600 : 'normal',
														transition: 'all 0.2s ease',
														cursor: hasStoryWord ? 'pointer' : 'default',
														border: isHovered
															? '1px solid rgba(108, 99, 255, 0.5)'
															: '1px solid transparent',
													}}
												>
													{segment.content}
												</span>
											);
										}
									})
								: translation}
						</Paragraph>
					</div>
				)}
			</Card>

			{/* Screen Reader Announcements */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				style={{
					position: 'absolute',
					left: '-10000px',
					width: '1px',
					height: '1px',
					overflow: 'hidden',
				}}
			>
				{screenReaderAnnouncement}
			</div>

			{/* Collection Drawer */}
			<CollectionDrawer
				ref={drawerRef}
				collectedWords={collectedWordsList}
				totalWords={metadata.totalWords}
				isExpanded={isDrawerExpanded}
				onToggle={handleToggleDrawer}
				onCompleteStory={onCompleteStory}
			/>

			{/* Ghost Animations */}
			{ghostAnimations.map((ghost) => {
				if (!drawerRef.current) return null;

				return (
					<GhostAnimation
						key={ghost.id}
						wordElement={ghost.wordElement}
						drawerElement={drawerRef.current}
						targetSlotIndex={ghost.targetSlotIndex}
						wordText={ghost.wordText}
						onComplete={handleGhostComplete(ghost.id)}
					/>
				);
			})}

			{/* Loading Overlay (when completing) */}
			{isCompleting && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(255, 255, 255, 0.9)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 10000,
					}}
				>
					<Space orientation="vertical" align="center" size={16}>
						<Spin size="large" />
						<Text strong style={{ fontSize: '16px' }}>
							Adding words to your flashcard deck...
						</Text>
					</Space>
				</div>
			)}
		</div>
	);
}
