/**
 * useKanjiWordTooltip Hook
 *
 * Custom hook for managing tooltip state and interactions
 * Extracted from KanjiWordTooltip component for reusability
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Vocabulary } from '@prisma/client';

import { calculateTooltipPosition } from '../utils/tooltipHelpers';
import { TOOLTIP_CONFIG } from '../constants';

export interface UseKanjiWordTooltipReturn {
	showTooltip: boolean;
	tooltipAnchor: HTMLElement | null;
	position: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
	isVisible: boolean;
	handleOpen: (element: HTMLElement) => void;
	handleClose: () => void;
}

/**
 * Custom hook for managing kanji word tooltip state
 *
 * @param vocab - Vocabulary object to display in tooltip (null to hide)
 * @returns Tooltip state and handlers
 *
 * @example
 * ```typescript
 * const { showTooltip, handleOpen, handleClose } = useKanjiWordTooltip(vocab);
 *
 * <span onMouseEnter={(e) => handleOpen(e.currentTarget)}>
 *   {word}
 * </span>
 * ```
 */
export function useKanjiWordTooltip(vocab: Vocabulary | null): UseKanjiWordTooltipReturn {
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);
	const [position, setPosition] = useState({ x: 0, y: 0, placement: 'top' as const });
	const [isVisible, setIsVisible] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// Calculate position when vocab/anchor changes
	useEffect(() => {
		if (!vocab || !tooltipAnchor || !tooltipRef.current) {
			setIsVisible(false);
			return;
		}

		const pos = calculateTooltipPosition(
			tooltipAnchor,
			TOOLTIP_CONFIG.WIDTH,
			TOOLTIP_CONFIG.HEIGHT,
		);
		setPosition(pos);
		setIsVisible(true);
	}, [vocab, tooltipAnchor]);

	const handleOpen = useCallback((element: HTMLElement) => {
		setTooltipAnchor(element);
		setShowTooltip(true);
	}, []);

	const handleClose = useCallback(() => {
		setShowTooltip(false);
		setTooltipAnchor(null);
		setIsVisible(false);
	}, []);

	return {
		showTooltip,
		tooltipAnchor,
		position,
		isVisible,
		handleOpen,
		handleClose,
		tooltipRef, // Expose ref for positioning calculations
	};
}
