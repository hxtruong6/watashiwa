import {
	ConfusionExplanation,
	EtymologyData,
	ExamplesData,
	MeaningsData,
	MnemonicData,
	StoryContent,
	VariantPayload,
} from '@/lib/schemas/jsonb';
import { CardVariant, ConfusionPair, Story, Vocabulary } from '@prisma/client';

/**
 * TypedVocabulary
 * Use this type in application code to ensure strict typing of JSON fields.
 */
export interface TypedVocabulary extends Omit<
	Vocabulary,
	'etymology' | 'meanings' | 'examples' | 'mnemonic'
> {
	etymology: EtymologyData;
	meanings: MeaningsData;
	examples: ExamplesData;
	mnemonic: MnemonicData | null;
}

/**
 * TypedStory
 * Use this type when handling Story objects to access structured content.
 */
export interface TypedStory extends Omit<Story, 'content'> {
	content: StoryContent;
}

/**
 * TypedCardVariant
 * Use this type for Flashcard variants to access the specific payload.
 */
export interface TypedCardVariant extends Omit<CardVariant, 'contentPayload'> {
	contentPayload: VariantPayload;
}

/**
 * TypedConfusionPair
 * Use this type for accessing confusion explanation structure.
 */
export interface TypedConfusionPair extends Omit<ConfusionPair, 'explanation'> {
	explanation: ConfusionExplanation;
}
