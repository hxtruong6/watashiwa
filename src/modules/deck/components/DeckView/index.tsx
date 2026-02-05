/**
 * DeckView - Main Component
 *
 * Refactored to follow Vertical Slice Architecture:
 * - Extracted state to custom hook
 * - Extracted sub-components
 * - Proper type safety
 * - Under 150 lines
 */

'use client';

import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import BackButton from '@/components/BackButton';
import { getDeckUrl } from '@/lib/utils/urls';
import CommentDrawer from '@/modules/community/components/comments/CommentDrawer';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Empty, Flex } from 'antd';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import { toggleVocabLearnt } from '../../deck.actions';
import type { DeckWithStats, VocabularyItem } from '../../types';
import { AddContentSection } from './AddContentSection';
import { ContentGridView } from './ContentGridView';
import { ContentListView } from './ContentListView';
import { DeckContentTabs } from './DeckContentTabs';
import { DeckHeader } from './DeckHeader';
import { FlashcardPreviewModal } from './FlashcardPreviewModal';
import { useVocabColumns } from './columns';
import { useDeckViewState } from './useDeckViewState';

interface DeckViewProps {
	deck: DeckWithStats;
	isOwner?: boolean;
}

export default function DeckView({ deck, isOwner }: DeckViewProps) {
	const t = useTranslations('Decks');
	/** Local overrides for learnt state so checkbox updates instantly (optimistic). Cleared on failure. */
	const [learntOverrides, setLearntOverrides] = useState<Map<string, boolean>>(new Map());

	const {
		viewMode,
		setViewMode,
		activeTab,
		setActiveTab,
		showAddContent,
		setShowAddContent,
		showMeaning,
		setShowMeaning,
		repeatPlayback,
		setRepeatPlayback,
		commentState,
		openComments,
		closeComments,
		previewState,
		openPreview,
		closePreview,
	} = useDeckViewState();

	const handleToggleLearnt = useCallback(
		async (record: VocabularyItem, learnt: boolean) => {
			// Optimistic update: show new state immediately so UI feels instant
			setLearntOverrides((prev) => new Map(prev).set(record.id, learnt));

			const result = await toggleVocabLearnt({
				deckId: deck.id,
				deckSlug: deck.slug,
				vocabId: record.id,
				learnt,
			});

			if (!result.success) {
				// Revert on failure
				setLearntOverrides((prev) => {
					const next = new Map(prev);
					next.delete(record.id);
					return next;
				});
			}
		},
		[deck.id, deck.slug],
	);

	const getLearnt = useCallback(
		(record: VocabularyItem) => learntOverrides.get(record.id) ?? record.learnt ?? false,
		[learntOverrides],
	);

	const [currentPlayingWordId, setCurrentPlayingWordId] = useState<string | null>(null);
	const stopPlayAllRef = React.useRef<(() => void) | null>(null);

	const [ttsSettings] = useState(() => {
		if (typeof window === 'undefined') return { voiceUri: '', speed: 1 };
		const savedVoice = localStorage.getItem('watashiwa_audio_voice');
		const savedSpeed = localStorage.getItem('watashiwa_audio_speed');
		return {
			voiceUri: savedVoice || '',
			speed: savedSpeed ? parseFloat(savedSpeed) : 1,
		};
	});
	const { speak, stop, isPlaying } = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	useEffect(() => {
		if (!isPlaying) {
			const id = requestAnimationFrame(() => setCurrentPlayingWordId(null));
			return () => cancelAnimationFrame(id);
		}
	}, [isPlaying]);

	const handlePlayAudio = useCallback(
		(record: VocabularyItem) => {
			stop();
			setCurrentPlayingWordId(record.id);
			speak(record.wordReading || record.wordSurface);
		},
		[speak, stop],
	);

	const vocabColumns = useVocabColumns((record) => openComments(record, 'vocab'), {
		onToggleLearnt: handleToggleLearnt,
		getLearnt,
		onPlayAudio: handlePlayAudio,
		currentPlayingWordId,
	});

	const vocabCount = deck.vocabularies ? deck.vocabularies.length : 0;
	const storiesCount = deck.stories ? deck.stories.length : 0;

	const stats = deck.stats || {
		total: 0,
		started: 0,
		new: 0,
		learning: 0,
		review: 0,
		unseen: 0,
	};

	const percentLearned = stats.total > 0 ? Math.round((stats.started / stats.total) * 100) : 0;

	// Trigger confetti if deck is fully learned
	React.useEffect(() => {
		if (percentLearned === 100) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
			});
		}
	}, [percentLearned]);

	const renderContent = (type: 'vocab' | 'story') => {
		const data = type === 'vocab' ? deck.vocabularies || [] : deck.stories || [];

		if (!data || data.length === 0) {
			return <Empty description={t('noItems', { type })} />;
		}

		// Stories only support grid view
		if (type === 'story') {
			return (
				<ContentGridView
					type={type}
					data={data}
					showMeaning={showMeaning}
					onItemClick={openPreview}
					onCommentClick={openComments}
				/>
			);
		}

		if (viewMode === 'List') {
			return (
				<ContentListView
					type={type}
					data={data as VocabularyItem[]}
					columns={vocabColumns}
					onRowClick={openPreview}
					currentPlayingWordId={currentPlayingWordId}
				/>
			);
		}

		return (
			<ContentGridView
				type={type}
				data={data}
				showMeaning={showMeaning}
				onItemClick={openPreview}
				onCommentClick={openComments}
				currentPlayingWordId={currentPlayingWordId}
				onStopPlayAll={() => {
					if (stopPlayAllRef.current) {
						stopPlayAllRef.current();
					}
				}}
			/>
		);
	};

	return (
		<div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
			<Flex align="center" gap="middle" style={{ marginBottom: 24 }}>
				<BackButton fallbackPath="/decks" />
				<Breadcrumb
					items={[
						{
							title: (
								<Link href="/">
									<HomeOutlined />
								</Link>
							),
						},
						{ title: <Link href="/decks">{t('libraryTitle')}</Link> },
						{
							title: <Link href={getDeckUrl({ slug: deck.slug })}>{deck.title}</Link>,
						},
					]}
				/>
			</Flex>

			{isOwner && (
				<div style={{ marginBottom: 24 }}>
					<AddContentSection
						deckId={deck.id}
						showAddContent={showAddContent}
						onShowAddContent={setShowAddContent}
					/>
				</div>
			)}

			<DeckHeader deck={deck} vocabCount={vocabCount} storiesCount={storiesCount} />

			<DeckContentTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				showMeaning={showMeaning}
				onShowMeaningChange={setShowMeaning}
				repeatPlayback={repeatPlayback}
				onRepeatPlaybackChange={setRepeatPlayback}
				vocabCount={vocabCount}
				storiesCount={storiesCount}
				vocabularies={deck.vocabularies || []}
				vocabContent={renderContent('vocab')}
				storyContent={renderContent('story')}
				onCurrentPlayingWordChange={setCurrentPlayingWordId}
				stopPlayAll={(stopFn: () => void) => {
					stopPlayAllRef.current = stopFn;
				}}
			/>

			<CommentDrawer
				open={commentState.drawerOpen}
				onClose={closeComments}
				entityId={commentState.entityId}
				entityTitle={commentState.entityTitle}
			/>

			<FlashcardPreviewModal
				open={previewState.open}
				item={previewState.item}
				type={previewState.type}
				onClose={closePreview}
			/>
		</div>
	);
}
