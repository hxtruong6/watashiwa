'use client';

import { SmartCard } from '@/modules/flashcard/types';
import type { RelatedWord } from '@/modules/study/types/related-words';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseSessionUIOptions {
	currentCard?: SmartCard | null;
}

export interface UseSessionUIReturn {
	// Drawers
	settingsVisible: boolean;
	setSettingsVisible: (visible: boolean) => void;
	isCommentDrawerOpen: boolean;
	setIsCommentDrawerOpen: (open: boolean) => void;
	isRelatedWordDrawerOpen: boolean;
	setIsRelatedWordDrawerOpen: (open: boolean) => void;
	selectedRelatedWord: RelatedWord | null;
	setSelectedRelatedWord: (word: RelatedWord | null) => void;

	// Modals
	isReportModalOpen: boolean;
	setIsReportModalOpen: (open: boolean) => void;

	// Helpers
	closeAllDrawers: () => void;
	hasAnyDrawerOpen: boolean; // For shortcuts disabled check
}

/**
 * Hook to manage UI state for study session (drawers, modals).
 *
 * Handles:
 * - Drawer states (settings, comments, related words)
 * - Modal states (report)
 * - Card navigation logic (close drawers on card change)
 * - Close all drawers helper
 *
 * @param options - Configuration for UI state management
 * @returns UI state and helper functions
 */
export function useSessionUI(options: UseSessionUIOptions): UseSessionUIReturn {
	const { currentCard } = options;

	// Drawer states
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
	const [isRelatedWordDrawerOpen, setIsRelatedWordDrawerOpen] = useState(false);
	const [selectedRelatedWord, setSelectedRelatedWord] = useState<RelatedWord | null>(null);

	// Modal states
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);

	// Track previous vocab ID to detect card changes
	const prevVocabIdRef = useRef<string | null>(null);

	// Close all drawers and modals helper
	const closeAllDrawers = useCallback(() => {
		setSettingsVisible(false);
		setIsReportModalOpen(false);
		setIsCommentDrawerOpen(false);
		// Note: We don't close related words drawer here as it's managed by card navigation
	}, []);

	// Compute if any drawer/modal is open (for shortcuts disabled check)
	const hasAnyDrawerOpen = useMemo(
		() => settingsVisible || isReportModalOpen || isCommentDrawerOpen || isRelatedWordDrawerOpen,
		[settingsVisible, isReportModalOpen, isCommentDrawerOpen, isRelatedWordDrawerOpen],
	);

	// Close Related Words Sheet on card navigation (AC5: State Management)
	// Track previous vocab ID to detect card changes
	// Note: setState in effect is necessary to react to card prop changes
	// This matches the original component pattern
	useEffect(() => {
		const currentVocabId = currentCard?.vocabId;
		if (
			currentVocabId &&
			prevVocabIdRef.current !== null &&
			prevVocabIdRef.current !== currentVocabId
		) {
			// Card changed - close sheet if open
			// Note: setState in effect is necessary to react to card prop changes
			// This is a valid pattern for synchronizing UI state with external prop changes
			if (isRelatedWordDrawerOpen) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setIsRelatedWordDrawerOpen(false);
				setSelectedRelatedWord(null);
			}
		}
		prevVocabIdRef.current = currentVocabId || null;
	}, [currentCard?.vocabId, isRelatedWordDrawerOpen]);

	return {
		// Drawers
		settingsVisible,
		setSettingsVisible,
		isCommentDrawerOpen,
		setIsCommentDrawerOpen,
		isRelatedWordDrawerOpen,
		setIsRelatedWordDrawerOpen,
		selectedRelatedWord,
		setSelectedRelatedWord,

		// Modals
		isReportModalOpen,
		setIsReportModalOpen,

		// Helpers
		closeAllDrawers,
		hasAnyDrawerOpen,
	};
}
