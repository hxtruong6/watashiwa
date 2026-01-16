/**
 * KanjiWord Component
 *
 * Reusable component for rendering kanji with furigana/romaji toggle
 * Supports hover tooltip with vocabulary details
 */
'use client';

import type { FuriganaMapping } from '@/lib/schemas/jsonb';
import { FuriganaMappingSchema } from '@/lib/schemas/jsonb';
import { generateFuriganaMapping, renderFurigana } from '@/lib/utils/furigana';
import type { Vocabulary } from '@prisma/client';
import { theme } from 'antd';
import { useCallback, useMemo, useState } from 'react';

import { SIZE_STYLES } from '../constants';
import type { KanjiWordProps, ReadingMode } from '../types';
import { extractJLPTLevel, getJLPTColor } from '../utils';
import { KanjiWordTooltip } from './KanjiWordTooltip';

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
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);

	// Determine reading mode
	const effectiveReadingMode: ReadingMode = useMemo(() => {
		if (readingMode) return readingMode;
		if (showFurigana && showRomaji) return 'both';
		if (showFurigana) return 'furigana';
		if (showRomaji) return 'romaji';
		return 'none';
	}, [readingMode, showFurigana, showRomaji]);

	// Get vocabulary data with validation
	const vocabData = useMemo(() => {
		if (vocab) return vocab;
		if (wordSurface && wordReading) {
			// Basic validation (non-empty strings)
			if (wordSurface.trim().length === 0 || wordReading.trim().length === 0) {
				if (process.env.NODE_ENV === 'development') {
					console.warn('KanjiWord: Invalid input - empty wordSurface or wordReading');
				}
				return null;
			}

			// Create minimal vocab object for display
			return {
				id: '',
				wordSurface: wordSurface.trim(),
				wordReading: wordReading.trim(),
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

	// Render furigana segments (handle null vocabData inside memo)
	const furiganaSegments = useMemo(() => {
		if (!vocabData?.wordSurface) return [];
		return renderFurigana(vocabData.wordSurface, furiganaMapping);
	}, [vocabData, furiganaMapping]);

	// Size styles
	const sizeStyles = SIZE_STYLES[size];

	// Handle hover/tap (handle null vocabData inside callbacks)
	const handleMouseEnter = useCallback(
		(e: React.MouseEvent<HTMLElement>) => {
			if (interactive && vocabData) {
				setTooltipAnchor(e.currentTarget);
				setShowTooltip(true);
			}
		},
		[interactive, vocabData],
	);

	const handleMouseLeave = useCallback(() => {
		if (interactive) {
			setShowTooltip(false);
		}
	}, [interactive]);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLElement>) => {
			if (interactive && vocabData) {
				// On mobile/touch, toggle tooltip on click
				if (!showTooltip) {
					setTooltipAnchor(e.currentTarget);
					setShowTooltip(true);
				}
			}
			if (onClick && vocabData) {
				onClick(vocabData);
			}
		},
		[interactive, vocabData, showTooltip, onClick],
	);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent<HTMLElement>) => {
			if (interactive && vocabData) {
				setTooltipAnchor(e.currentTarget);
				setShowTooltip(true);
			}
		},
		[interactive, vocabData],
	);

	// JLPT underline color
	const underlineColor = useMemo(() => {
		if (!showCategoryUnderline || !effectiveJLPTLevel) return 'transparent';
		return getJLPTColor(effectiveJLPTLevel);
	}, [showCategoryUnderline, effectiveJLPTLevel]);

	// Early return after all hooks
	if (!vocabData) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('KanjiWord: Missing vocab or wordSurface/wordReading');
		}
		return null;
	}

	return (
		<>
			<span
				className={className}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
				onTouchStart={handleTouchStart}
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
					// Render with furigana using <ruby> tags
					<ruby style={{ rubyAlign: 'start', fontSize: sizeStyles.fontSize }}>
						{furiganaSegments.map((segment, idx) => {
							if (segment.isKanji && segment.reading) {
								return (
									<ruby key={idx} style={{ rubyAlign: 'start' }}>
										{segment.text}
										<rt
											style={{
												fontSize: sizeStyles.furiganaSize,
												color: token.colorTextSecondary,
												fontWeight: 'normal',
											}}
										>
											{segment.reading}
										</rt>
									</ruby>
								);
							}
							return <span key={idx}>{segment.text}</span>;
						})}
					</ruby>
				) : (
					// Render without furigana
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

			{/* Tooltip */}
			{showTooltip && vocabData && (
				<KanjiWordTooltip
					vocab={vocabData}
					anchorElement={tooltipAnchor}
					onClose={() => setShowTooltip(false)}
					onSeeMore={onSeeMore}
				/>
			)}
		</>
	);
}
