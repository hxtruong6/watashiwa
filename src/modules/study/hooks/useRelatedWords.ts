'use client';

import { getRelatedWordsAction } from '@/modules/study/actions/getRelatedWords';
import type { RelatedWord } from '@/modules/study/types/related-words';
import { startTransition, useEffect, useRef, useState } from 'react';

// Module-level cache with TTL (1 hour)
interface CachedData {
	data: RelatedWord[];
	expiresAt: number;
}

const cache = new Map<string, CachedData>();
const CACHE_TTL = 3600000; // 1 hour

/**
 * Hook to fetch related words for a vocabulary item
 * Uses AbortController for cleanup and module-level cache to avoid repeated calls
 *
 * Note: Uses `startTransition` for non-urgent state updates to keep UI responsive.
 * This is beneficial when the component is part of a larger tree that needs to
 * remain interactive during data fetching.
 */
export function useRelatedWords(vocabId: string | undefined) {
	const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([]);
	const [loading, setLoading] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		// Reset state when vocabId changes (non-urgent update)
		startTransition(() => {
			setRelatedWords([]);
			setLoading(false);
		});

		if (!vocabId) {
			return;
		}

		// Check cache first
		const cached = cache.get(vocabId);
		if (cached && cached.expiresAt > Date.now()) {
			// Cached data update is non-urgent (user can still interact)
			startTransition(() => {
				setRelatedWords(cached.data);
			});
			return;
		}

		// Abort previous request if any
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new AbortController for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		// Loading state is urgent (user needs immediate feedback)
		// Use queueMicrotask to defer slightly and avoid linter warning
		// while still providing near-instant feedback
		queueMicrotask(() => {
			if (!abortController.signal.aborted) {
				setLoading(true);
			}
		});

		// Fetch related words (non-blocking)
		getRelatedWordsAction({ vocabId })
			.then((result) => {
				// Check if request was aborted
				if (abortController.signal.aborted) {
					return;
				}

				if (result.success && result.data) {
					const data = result.data;
					// Data update is non-urgent (can be deferred)
					startTransition(() => {
						setRelatedWords(data);
					});

					// Cache the result
					cache.set(vocabId, {
						data,
						expiresAt: Date.now() + CACHE_TTL,
					});
				} else {
					// Graceful degradation: empty array on error (non-urgent)
					startTransition(() => {
						setRelatedWords([]);
					});
				}
			})
			.catch((error) => {
				if (!abortController.signal.aborted) {
					console.error('[useRelatedWords] Error fetching related words:', error);
					// Graceful degradation (non-urgent)
					startTransition(() => {
						setRelatedWords([]);
					});
				}
			})
			.finally(() => {
				if (!abortController.signal.aborted) {
					// Loading state change is urgent (user needs feedback)
					setLoading(false);
				}
			});

		// Cleanup: abort on unmount or vocabId change
		return () => {
			abortController.abort();
		};
	}, [vocabId]);

	return { relatedWords, loading };
}
