/**
 * Deck Module - Types
 *
 * Type definitions for deck-related components
 */
import type { FuriganaMapping } from '@/lib/schemas/jsonb';

export interface DeckStats {
	total: number;
	started: number;
	new: number;
	learning: number;
	review: number;
	unseen: number;
}

export interface DeckWithStats {
	id: string;
	title: string;
	description: string | null;
	slug: string;
	isPublic: boolean;
	authorId: string;
	headerImage: string | null;
	stats: DeckStats;
	vocabularies?: VocabularyItem[];
	stories?: StoryItem[];
	_count: {
		vocabularies: number;
		stories: number;
	};
}

export interface VocabularyItem {
	id: string;
	wordSurface: string;
	wordReading: string;
	meanings: {
		vi?: string[];
		en?: string[];
		[key: string]: string[] | undefined;
	};
	hanViet?: string | null;
	furiganaMapping?: FuriganaMapping | null;
	_count?: {
		cardComments: number;
	};
}

export interface StoryItem {
	id: string;
	content: {
		title?: {
			vi?: string;
			en?: string;
		};
		body_text?: string;
	};
	_count?: {
		cardComments: number;
	};
}

export type ContentType = 'vocab' | 'story';
export type ViewMode = 'List' | 'Grid';
