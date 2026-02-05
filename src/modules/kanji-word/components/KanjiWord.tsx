/**
 * KanjiWord Component
 *
 * Reusable component for rendering kanji with furigana/romaji toggle
 * Supports hover tooltip with vocabulary details
 */
'use client';

import type { FuriganaMapping } from '@/lib/schemas/jsonb';
import { FuriganaMappingSchema } from '@/lib/schemas/jsonb';
import { generateFuriganaMapping } from '@/lib/utils/furigana';
import { WordWithFurigana } from '@/modules/vocabulary/components/WordWithFurigana';
import type { Vocabulary } from '@prisma/client';
import { Popover, theme } from 'antd';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getVocabByWordSurfaceAction } from '../actions';
import { SIZE_STYLES } from '../constants';
import type { KanjiWordProps, ReadingMode } from '../types';
import { extractJLPTLevel, getJLPTColor } from '../utils';
import { KanjiWordPopoverContent } from './KanjiWordPopoverContent';

const { useToken } = theme;

export function KanjiWord({
	vocab,
	wordSurface,
	wordReading,
	wordRomaji,
	showFurigana = true,
	showRomaji = false,
	readingMode,
	jlptLevel,
	showCategoryUnderline = false,
	interactive = true,
	onClick,
	onSeeMore,
	size = 'medium',
	className,
}: KanjiWordProps) {
	const { token } = useToken();
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [loadedVocab, setLoadedVocab] = useState<Vocabulary | null>(null);
	const [isLoadingVocab, setIsLoadingVocab] = useState(false);
	const hasFetchedRef = useRef(false);

	// Use vocab if provided, otherwise use loadedVocab
	const currentVocab = vocab || loadedVocab;

	// Determine reading mode
	const effectiveReadingMode: ReadingMode = useMemo(() => {
		if (readingMode) return readingMode;
		if (showFurigana && showRomaji) return 'both';
		if (showFurigana) return 'furigana';
		if (showRomaji) return 'romaji';
		return 'none';
	}, [readingMode, showFurigana, showRomaji]);

	// Get vocabulary data with validation
	// Allow rendering with just wordSurface (for fetching on hover)
	const vocabData = useMemo(() => {
		if (vocab) return vocab;
		if (wordSurface) {
			// Basic validation (non-empty string)
			if (wordSurface.trim().length === 0) {
				if (process.env.NODE_ENV === 'development') {
					console.warn('KanjiWord: Invalid input - empty wordSurface');
				}
				return null;
			}

			// Create minimal vocab object for display
			// wordReading is optional - can be fetched on hover
			return {
				id: '',
				wordSurface: wordSurface.trim(),
				wordReading: wordReading?.trim() || '',
				wordRomaji: wordRomaji?.trim() || null,
				hanViet: null,
				meanings: {},
				audioUrl: null,
				tags: [],
				etymology: {},
				examples: [],
				mnemonic: null,
				contentStatus: 'PUBLISHED' as const,
				deckId: '',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
				wordOrder: 0,
				pitchPattern: null,
				pitchSvgPath: null,
				homonymGroupId: null,
				furiganaMapping: null,
				imageUrl: null,
				verifiedAt: null,
				verifiedBy: null,
			} as unknown as Vocabulary;
		}
		return null;
	}, [vocab, wordSurface, wordReading, wordRomaji]);

	// Extract JLPT level (handle null vocabData inside memo)
	const effectiveJLPTLevel = useMemo(() => {
		if (jlptLevel !== undefined) return jlptLevel;
		if (vocabData?.tags) {
			return extractJLPTLevel(vocabData.tags);
		}
		return null;
	}, [jlptLevel, vocabData]);

	// Generate furigana mapping (handle null vocabData inside memo)
	const furiganaMapping: FuriganaMapping | null = useMemo(() => {
		if (!vocabData?.wordSurface || !vocabData?.wordReading) return null;

		// Try to use existing furigana mapping from vocab
		if (vocabData.furiganaMapping) {
			try {
				const parsed = FuriganaMappingSchema.parse(vocabData.furiganaMapping);
				return parsed;
			} catch {
				// Invalid mapping, fall through to generate
			}
		}

		// Fallback: Generate mapping automatically
		return generateFuriganaMapping(vocabData.wordSurface, vocabData.wordReading);
	}, [vocabData]);

	// Size styles
	const sizeStyles = SIZE_STYLES[size];

	// Fetch vocab from server if not provided and we have wordSurface
	useEffect(() => {
		// If vocab is provided, reset loadedVocab and fetch flag
		if (vocab) {
			startTransition(() => {
				setLoadedVocab(null);
				hasFetchedRef.current = false;
			});
		}
		// If no vocab but we have wordSurface and popover is open, fetch it
		if (!vocab && vocabData?.wordSurface && popoverOpen && !hasFetchedRef.current) {
			startTransition(() => {
				setIsLoadingVocab(true);
				hasFetchedRef.current = true;
			});
			getVocabByWordSurfaceAction({ wordSurface: vocabData.wordSurface })
				.then((result: { success: boolean; data?: Vocabulary | null }) => {
					if (result.success && result.data) {
						setLoadedVocab(result.data);
					} else {
						setLoadedVocab(null);
					}
				})
				.catch((error: unknown) => {
					console.error('Failed to fetch vocab:', error);
					setLoadedVocab(null);
				})
				.finally(() => {
					setIsLoadingVocab(false);
				});
		}
	}, [vocab, vocabData, popoverOpen]);

	const handleClick = useCallback(() => {
		if (onClick && vocabData) {
			onClick(vocabData);
		}
	}, [onClick, vocabData]);

	const handlePopoverOpenChange = useCallback((open: boolean) => {
		setPopoverOpen(open);
		if (!open) {
			// Reset fetch flag when popover closes
			hasFetchedRef.current = false;
		}
	}, []);

	// JLPT underline color
	const underlineColor = useMemo(() => {
		if (!showCategoryUnderline || !effectiveJLPTLevel) return 'transparent';
		return getJLPTColor(effectiveJLPTLevel);
	}, [showCategoryUnderline, effectiveJLPTLevel]);

	// Early return after all hooks
	// Only return null if we have absolutely no data (no vocab, no wordSurface)
	if (!vocabData) {
		// Only warn if we have no data at all (not just missing wordReading)
		if (process.env.NODE_ENV === 'development' && !wordSurface) {
			console.warn('KanjiWord: Missing vocab and wordSurface - cannot render');
		}
		return null;
	}

	const wordContent = (
		<span
			className={className}
			onClick={handleClick}
			style={{
				display: 'inline-block',
				cursor: interactive ? 'pointer' : 'default',
				position: 'relative',
				textDecoration: underlineColor !== 'transparent' ? 'underline' : 'none',
				textDecorationColor: underlineColor,
				textDecorationThickness: '2px',
				textUnderlineOffset: '2px',
			}}
		>
			{effectiveReadingMode === 'furigana' || effectiveReadingMode === 'both' ? (
				<WordWithFurigana
					wordSurface={vocabData.wordSurface}
					wordReading={vocabData.wordReading || undefined}
					furiganaMapping={furiganaMapping}
					showReadingLine={false}
					fontSize={sizeStyles.fontSize}
					rtFontSize={sizeStyles.furiganaSize}
					as="span"
					style={{ display: 'inline-block' }}
				/>
			) : (
				<span style={{ fontSize: sizeStyles.fontSize }}>{vocabData.wordSurface}</span>
			)}

			{/* Romaji below (if enabled) */}
			{(effectiveReadingMode === 'romaji' || effectiveReadingMode === 'both') &&
				vocabData.wordRomaji && (
					<span
						style={{
							display: 'block',
							fontSize: sizeStyles.romajiSize,
							color: token.colorTextTertiary,
							fontStyle: 'italic',
							marginTop: '2px',
						}}
					>
						{vocabData.wordRomaji}
					</span>
				)}
		</span>
	);

	// If not interactive, return word content without popover
	if (!interactive || !vocabData) {
		return wordContent;
	}

	// Wrap with Popover for interactive words
	return (
		<Popover
			content={
				<KanjiWordPopoverContent
					vocab={currentVocab}
					isLoading={isLoadingVocab}
					onSeeMore={onSeeMore}
				/>
			}
			trigger={['hover', 'click']}
			open={popoverOpen}
			onOpenChange={handlePopoverOpenChange}
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
			{wordContent}
		</Popover>
	);
}
