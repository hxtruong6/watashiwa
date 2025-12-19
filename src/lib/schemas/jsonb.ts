import { z } from 'zod';

// Shared Localization Schema
export const LocalizedStringSchema = z.object({
	vi: z.string(),
	en: z.string(),
});

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
		note: LocalizedStringSchema.optional(), // Was note_vi, note_en
	})
	.strict();

export type EtymologyData = z.infer<typeof EtymologySchema>;

// -----------------------------------------------------------------------------
// 2. STORY CONTENT (Story.content)
// -----------------------------------------------------------------------------

export const StoryHighlightSchema = z
	.object({
		vocab_id: z.uuid(),
		word_surface: z.string().min(1),
		start_index: z.number().int().nonnegative(),
		length: z.number().int().positive(),
	})
	.strict();

export const StoryContentSchema = z
	.object({
		title: LocalizedStringSchema,
		body_text: z.string(),
		translation: LocalizedStringSchema.optional(), // Added for consistency with data_rules.md example
		highlights: z.array(StoryHighlightSchema),
	})
	.strict();

export type StoryContent = z.infer<typeof StoryContentSchema>;

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
