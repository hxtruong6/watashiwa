/**
 * StoryReader Component
 *
 * Main container for Contextual Story Reader
 * Orchestrates WordPill, SmartTooltip, and CollectionDrawer
 */

'use client';

import { trackEvent } from '@/lib/analytics';
import { TranslationOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Space, Spin, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { completeStoryAction, updateStoryProgressAction } from '../actions';
import { useAutoSaveProgress, useStoryProgress } from '../hooks/useStoryProgress';
import { useTextSegmentation } from '../hooks/useTextSegmentation';
import { useWordCollection } from '../hooks/useWordCollection';
import { StoryWithVocabularies, VocabMeta } from '../types';
import { playCollectionSound, triggerHaptic } from '../utils/animationHelpers';
import { CollectionDrawer } from './CollectionDrawer';
import { GhostAnimation } from './GhostAnimation';
import { SmartTooltip } from './SmartTooltip';
import { WordPill } from './WordPill';

const { Title, Text, Paragraph } = Typography;

interface StoryReaderProps {
	story: StoryWithVocabularies;
	locale?: 'en' | 'vi';
	onComplete?: () => void;
	redirectOnComplete?: string; // URL to redirect to after completion (for Server Component usage)
}

export function StoryReader({
	story,
	locale = 'en',
	onComplete,
	redirectOnComplete,
}: StoryReaderProps) {
	const router = useRouter();
	// State management
	const [showTranslation, setShowTranslation] = useState(false);
	const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
	const [activeTooltip, setActiveTooltip] = useState<{
		vocab: VocabMeta | null;
		anchor: HTMLElement | null;
	}>({
		vocab: null,
		anchor: null,
	});
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
	const { segments, translation, metadata } = useTextSegmentation({ story, locale });
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
				setActiveTooltip({ vocab: meta, anchor: wordElement });

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
	const handleOpenTooltip = useCallback((vocab: VocabMeta, anchor: HTMLElement) => {
		setActiveTooltip({ vocab, anchor });
	}, []);

	// Handle tooltip close
	const handleCloseTooltip = useCallback(() => {
		setActiveTooltip({ vocab: null, anchor: null });
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

			{/* Translation Toggle */}
			<Button
				icon={<TranslationOutlined />}
				onClick={onToggleTranslation}
				style={{ marginBottom: '16px' }}
				type={showTranslation ? 'primary' : 'default'}
			>
				{showTranslation ? 'Hide' : 'Show'} Translation
			</Button>

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
							return (
								<WordPill
									key={index}
									vocab={segment.meta}
									isCollected={isCollected}
									onClick={onWordClick}
									onOpenTooltip={handleOpenTooltip}
								/>
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
							{translation}
						</Paragraph>
					</div>
				)}
			</Card>

			{/* Smart Tooltip */}
			<SmartTooltip
				vocab={activeTooltip.vocab}
				anchorElement={activeTooltip.anchor}
				isCollected={
					activeTooltip.vocab ? isWordCollected(activeTooltip.vocab.vocabularyId) : false
				}
				onClose={handleCloseTooltip}
				onAudioPlay={handleAudioPlay}
			/>

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
