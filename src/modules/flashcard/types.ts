import { Vocabulary as PrismaVocabulary } from '@prisma/client';

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
	// Parsed JSON Content
	meanings: {
		[lang: string]: string[]; // { "vi": ["..."], "en": ["..."] }
	};
	etymology: {
		parts: Array<{ kanji: string; han_viet: string; meaning: string }>;
		note_vi?: string;
	};
	mnemonic?: {
		en: string;
		vi: string;
		image_url?: string;
	} | null;
	examples: Array<{
		sentence: string;
		translation: { [lang: string]: string };
		audio?: string;
	}>;

	// Virtual Fields (Pre-processed for UI)
	han_viet_extracted: string; // "TIÊN SINH" from tags or custom logic
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
		sentencePrefix: string; // "Tôi đi "
		sentenceSuffix: string; // " mua táo"
		hint?: string; // "School"
	};
	back: {
		answer: string; // "学校"
		details: Vocabulary;
	};
}

// VARIANT C: INTERVENTION (Confusion Shield)
export interface InterventionCard extends CardBase {
	variant: 'INTERVENTION';
	front: {
		question: string; // "Which matches the audio?"
		audio: string;
	};
	content: {
		options: Array<{
			id: string;
			image?: string;
			label: string;
			isCorrect: boolean;
			pitchPattern?: number;
		}>;
	};
	back: {
		explanation: string; // "Hashi (Bridge) goes UP."
		details: Vocabulary;
	};
}
