/**
 * useDismissibleTooltip – Show a tooltip only N times, then hide via localStorage
 *
 * Use for hints users learn quickly (e.g. "Play audio"). After maxShows opens,
 * the tooltip is no longer shown. Reusable across DeckView, Grid, settings, etc.
 */
import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'watashiwa_dismissible_tooltip_';

function getStoredCount(storageKey: string): number {
	if (typeof window === 'undefined') return 0;
	const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
	const n = parseInt(raw ?? '0', 10);
	return Number.isNaN(n) ? 0 : n;
}

export interface UseDismissibleTooltipOptions {
	/** Max number of times to show the tooltip. Default 3. */
	maxShows?: number;
}

export interface UseDismissibleTooltipReturn {
	/** If true, show the tooltip (title); if false, treat as no tooltip. */
	showTooltip: boolean;
	/** Call when the tooltip opens (e.g. Tooltip onOpenChange(true)). Persists count and may set showTooltip false. */
	onOpenChange: (open: boolean) => void;
}

/**
 * @param storageKey – Unique key for this tooltip (e.g. 'audio_play'). Stored as watashiwa_dismissible_tooltip_<key>.
 * @param options – Optional { maxShows } (default 3).
 */
export function useDismissibleTooltip(
	storageKey: string,
	options?: UseDismissibleTooltipOptions,
): UseDismissibleTooltipReturn {
	const maxShows = options?.maxShows ?? 3;
	const [showCount, setShowCount] = useState(() => getStoredCount(storageKey));
	const showTooltip = showCount < maxShows;

	const onOpenChange = useCallback(
		(open: boolean) => {
			if (!open) return;
			const next = showCount + 1;
			if (typeof window !== 'undefined') {
				localStorage.setItem(STORAGE_PREFIX + storageKey, String(next));
			}
			setShowCount(next);
		},
		[storageKey, showCount],
	);

	return { showTooltip, onOpenChange };
}
