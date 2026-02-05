import { z } from 'zod';

// Shared Localization Schema
export const LocalizedStringSchema = z.object({
	vi: z.string(),
	en: z.string(),
});
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;
export type MnemonicData = LocalizedString;

// -----------------------------------------------------------------------------
// 0. SHARED SCHEMAS
// -----------------------------------------------------------------------------

export const MeaningsSchema = z.record(z.string(), z.array(z.string()));
export type MeaningsData = z.infer<typeof MeaningsSchema>;

export const ExampleSentenceSchema = z.object({
	sentence: z.string(),
	translation: LocalizedStringSchema,
	audio: z.string().optional(),
});
export const ExamplesSchema = z.array(ExampleSentenceSchema);
export type ExamplesData = z.infer<typeof ExamplesSchema>;

// -----------------------------------------------------------------------------
// 1. ETYMOLOGY (Vocabulary.etymology)
// -----------------------------------------------------------------------------

export const EtymologyPartSchema = z
	.object({
		kanji: z.string().min(1),
		han_viet: z.string().min(1), // Sino-Vietnamese is specific to VI context, but it IS the reading.
		meaning: LocalizedStringSchema,
		stroke_count: z.number().int().optional(),
	})
	.strict();

export const EtymologySchema = z
	.object({
		parts: z.array(EtymologyPartSchema),
		note: LocalizedStringSchema.optional(),
	})
	.strict();

export type EtymologyData = z.infer<typeof EtymologySchema>;

// -----------------------------------------------------------------------------
// 2. STORY CONTENT (Story.content)
// -----------------------------------------------------------------------------

// Extended localized string with Japanese
export const MultiLangStringSchema = z.object({
	en: z.string(),
	vi: z.string(),
	ja: z.string(),
});
export type MultiLangString = z.infer<typeof MultiLangStringSchema>;

// Story highlight (deprecated - now stored in StoryVocabulary table)
// Kept for backward compatibility with existing data
export const StoryHighlightSchema = z
	.object({
		vocab_id: z.uuid(),
		word_surface: z.string().min(1),
		start_index: z.number().int().nonnegative(),
		length: z.number().int().positive(),
	})
	.strict();

// Story Content Schema (Enhanced for Contextual Story Reader)
export const StoryContentSchema = z
	.object({
		title: LocalizedStringSchema, // Title in EN, VI only
		body_text: MultiLangStringSchema, // Story text in EN, VI, JA
		translation: LocalizedStringSchema, // Full translation (EN, VI) as safety net
		highlights: z.array(z.string()).optional(), // Array of vocabulary word strings (deprecated, kept for migration)
	})
	.strict();

export type StoryContent = z.infer<typeof StoryContentSchema>;

// Story Analytics Schema (StoryLog.analytics)
export const StoryAnalyticsSchema = z
	.object({
		clicked_words: z.array(z.string()).default([]), // Vocabulary IDs clicked
		translation_used: z.boolean().default(false), // Did user reveal translation?
		paused_at: z.array(z.number()).default([]), // Seconds when user paused reading
		audio_plays: z.number().int().default(0), // How many word audios played
		reading_language: z.enum(['en', 'vi', 'ja']).default('en'), // Which language user read in
	})
	.strict();

export type StoryAnalytics = z.infer<typeof StoryAnalyticsSchema>;

// Story Positions Schema (StoryVocabulary.positions)
export const StoryPositionsSchema = z.object({
	en: z.array(z.number().int().nonnegative()), // Positions in English text
	vi: z.array(z.number().int().nonnegative()), // Positions in Vietnamese text
	ja: z.array(z.number().int().nonnegative()), // Positions in Japanese text
});

export type StoryPositions = z.infer<typeof StoryPositionsSchema>;

// -----------------------------------------------------------------------------
// 3. CONFUSION PAIR (ConfusionPair.explanation)
// -----------------------------------------------------------------------------

export const ConfusionExplanationSchema = z
	.object({
		mnemonic: LocalizedStringSchema,
		item1_nuance: LocalizedStringSchema,
		item2_nuance: LocalizedStringSchema,
	})
	.strict();

export type ConfusionExplanation = z.infer<typeof ConfusionExplanationSchema>;

// -----------------------------------------------------------------------------
// 4. CARD VARIANTS (CardVariant.contentPayload)
// -----------------------------------------------------------------------------

// TYPE 1: GAP FILL
export const GapFillPayloadSchema = z
	.object({
		type: z.literal('GAP_FILL').optional(), // OPTIONAL helper tag for easier frontend parsing
		question_template: z.string(),
		correct_answer: z.string(),
		distractors: z.array(z.string()),
		translation: LocalizedStringSchema,
	})
	.strict();

// TYPE 2: AUDIO MATCH
export const AudioMatchChoiceSchema = z
	.object({
		image_url: z.url(),
		label: z.string(),
		is_correct: z.boolean(),
	})
	.strict();

export const AudioMatchPayloadSchema = z
	.object({
		type: z.literal('AUDIO_MATCH').optional(), // OPTIONAL helper tag
		audio_url: z.url(),
		choices: z.array(AudioMatchChoiceSchema),
	})
	.strict();

// TYPE 3: INTERVENTION (New - from my previous advice)
export const InterventionPayloadSchema = z
	.object({
		type: z.literal('INTERVENTION').optional(),
		confusing_word_id: z.uuid(),
		comparison_note: LocalizedStringSchema,
	})
	.strict();

// Polymorphic Union
export const VariantPayloadSchema = z.union([
	GapFillPayloadSchema,
	AudioMatchPayloadSchema,
	InterventionPayloadSchema,
	z.null(),
]);

export type GapFillPayload = z.infer<typeof GapFillPayloadSchema>;
export type AudioMatchPayload = z.infer<typeof AudioMatchPayloadSchema>;
export type InterventionPayload = z.infer<typeof InterventionPayloadSchema>;
export type VariantPayload = z.infer<typeof VariantPayloadSchema>;

// -----------------------------------------------------------------------------
// 5. FURIGANA MAPPING (Vocabulary.furiganaMapping)
// -----------------------------------------------------------------------------

/**
 * Furigana Mapping Schema
 * Maps kanji characters in wordSurface to their reading segments in wordReading
 *
 * Example: "休みます" (wordSurface) with "やすみます" (wordReading)
 * {
 *   mappings: [
 *     { kanji: "休", reading: "やす", surfaceIndex: 0, readingStart: 0, readingEnd: 2 }
 *   ]
 * }
 *
 * This allows precise rendering: only "やす" appears above "休", not above "みます"
 */
export const FuriganaMappingItemSchema = z
	.object({
		kanji: z.string().min(1), // The kanji character(s) - can be single or compound
		reading: z.string().min(1), // The reading segment for this kanji
		surfaceIndex: z.number().int().nonnegative(), // Position in wordSurface where kanji starts
		readingStart: z.number().int().nonnegative(), // Start position in wordReading
		readingEnd: z.number().int().positive(), // End position in wordReading (exclusive)
	})
	.strict();

export const FuriganaMappingSchema = z
	.object({
		mappings: z.array(FuriganaMappingItemSchema),
	})
	.strict();

export type FuriganaMappingItem = z.infer<typeof FuriganaMappingItemSchema>;
export type FuriganaMapping = z.infer<typeof FuriganaMappingSchema>;
