import { EtymologySchema, ExamplesSchema, MeaningsSchema } from '@/lib/schemas/jsonb';
import { Vocabulary as PrismaVocabulary } from '@prisma/client';
import { z } from 'zod';

// ------------------------------------------------------------------
// 1. EXTENDED VOCABULARY (THE ANCHOR)
// ------------------------------------------------------------------

/**
 * Extends the raw Prisma type with Parsed JSON fields.
 * We do NOT interact with raw JSON in the UI components.
 */
export interface Vocabulary extends Omit<
	PrismaVocabulary,
	'meanings' | 'etymology' | 'mnemonic' | 'examples'
> {
	// Parsed JSON Content (Inferred from Zod Source of Truth)
	meanings: z.infer<typeof MeaningsSchema>;
	etymology: z.infer<typeof EtymologySchema>;
	examples: z.infer<typeof ExamplesSchema>;

	mnemonic?: {
		en: string;
		vi: string;
		image_url?: string;
	} | null;
}

// ------------------------------------------------------------------
// 2. SMART CARD VARIANTS (THE CHAMELEON)
// ------------------------------------------------------------------

export type SmartCard = StandardCard | GapFillCard | InterventionCard;

export type CardVariantType = 'BASIC' | 'GAP_FILL' | 'INTERVENTION' | 'AUDIO_MATCH';

export interface CardBase {
	id: string; // Session Item ID (UserReview ID or temp ID)
	vocabId: string;
	nextReview: Date | null;
	srsStage: number; // 0 (New) to 3 (Master)
}

// VARIANT A: STANDARD (The default look)
export interface StandardCard extends CardBase {
	variant: 'BASIC';
	front: {
		hero: string; // Kanji or Image
		reading?: string; // Furigana hint
		audio?: string;
	};
	back: {
		details: Vocabulary; // Full access for the back of card
	};
}

// VARIANT B: GAP FILL (Context)
export interface GapFillCard extends CardBase {
	variant: 'GAP_FILL';
	front: {
		sentencePrefix: string;
		sentenceSuffix: string;
		hint?: string;
	};
	back: {
		answer: string;
		details: Vocabulary;
	};
}

// VARIANT C: INTERVENTION (Confusion Shield)
export interface InterventionCard extends CardBase {
	variant: 'INTERVENTION';
	// Hydrated Comparison Data
	comparison: {
		type: 'HOMONYM' | 'LOOKALIKE';
		itemA: Vocabulary; // The current card
		itemB: Vocabulary; // The confusing partner
		audioUrl?: string; // Audio to play (could be A or B)
		targetId: string; // The correct answer ID
	};
	front: {
		question: string;
	};
	back: {
		details: Vocabulary; // usually itemA
	};
}
