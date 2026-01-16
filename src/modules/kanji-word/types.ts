/**
 * KanjiWord Module - Types
 *
 * Types for the reusable KanjiWord component
 */
import type { Vocabulary } from '@prisma/client';

export type ReadingMode = 'furigana' | 'romaji' | 'both' | 'none';

export type KanjiWordSize = 'small' | 'medium' | 'large';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface KanjiWordProps {
	// Required: Either vocab object OR wordSurface + wordReading
	vocab?: Vocabulary;
	wordSurface?: string;
	wordReading?: string;
	wordRomaji?: string;

	// Display options
	showFurigana?: boolean;
	showRomaji?: boolean;
	readingMode?: ReadingMode;

	// Visual
	jlptLevel?: JLPTLevel | null;
	showCategoryUnderline?: boolean;

	// Interaction
	interactive?: boolean;
	onClick?: (vocab: Vocabulary | null) => void;
	onSeeMore?: (vocabId: string) => void;

	// Styling
	size?: KanjiWordSize;
	className?: string;
}

export interface KanjiWordTooltipProps {
	vocab: Vocabulary | null;
	anchorElement: HTMLElement | null;
	onClose: () => void;
	onSeeMore?: (vocabId: string) => void;
}

export interface KanjiWordProviderProps {
	children: React.ReactNode;
	vocabCache?: Map<string, Vocabulary>;
	enableAutoDetection?: boolean;
}

export interface ParsedKanjiSegment {
	type: 'kanji' | 'text';
	content: string;
	vocab?: Vocabulary;
	startIndex: number;
	endIndex: number;
}
