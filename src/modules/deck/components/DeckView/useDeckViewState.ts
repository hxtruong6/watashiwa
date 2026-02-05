/**
 * DeckView - State Management Hook
 *
 * Extracts all state logic from DeckView component
 */
import { useState } from 'react';

import type { ContentType, StoryItem, VocabularyItem } from '../../types';

export interface CommentState {
	drawerOpen: boolean;
	entityId: string | undefined;
	entityType: ContentType | undefined;
	entityTitle: string | undefined;
}

export interface PreviewState {
	open: boolean;
	item: VocabularyItem | StoryItem | null;
	type: ContentType;
}

export function useDeckViewState() {
	const [viewMode, setViewMode] = useState<'List' | 'Grid'>('List');
	const [activeTab, setActiveTab] = useState<ContentType>('vocab');
	const [showAddContent, setShowAddContent] = useState(false);
	const [showMeaning, setShowMeaning] = useState(true);
	const [repeatPlayback, setRepeatPlayback] = useState(false);

	// Comment Drawer State
	const [commentState, setCommentState] = useState<CommentState>({
		drawerOpen: false,
		entityId: undefined,
		entityType: undefined,
		entityTitle: undefined,
	});

	// Flashcard Preview State
	const [previewState, setPreviewState] = useState<PreviewState>({
		open: false,
		item: null,
		type: 'vocab',
	});

	const openComments = (item: VocabularyItem | StoryItem, type: ContentType) => {
		setCommentState({
			drawerOpen: true,
			entityId: item.id,
			entityType: type,
			entityTitle:
				type === 'vocab'
					? (item as VocabularyItem).wordSurface
					: (item as StoryItem).content?.title?.vi ||
						(item as StoryItem).content?.title?.en ||
						'Story',
		});
	};

	const closeComments = () => {
		setCommentState({
			drawerOpen: false,
			entityId: undefined,
			entityType: undefined,
			entityTitle: undefined,
		});
	};

	const openPreview = (item: VocabularyItem | StoryItem, type: ContentType) => {
		setPreviewState({
			open: true,
			item,
			type,
		});
	};

	const closePreview = () => {
		setPreviewState({
			open: false,
			item: null,
			type: 'vocab',
		});
	};

	return {
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
	};
}
