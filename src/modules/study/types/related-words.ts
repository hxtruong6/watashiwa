import { Vocabulary } from '@/modules/flashcard/types';

export type RelatedWordRelationshipType =
	| { kind: 'confusion'; confusionType: string }
	| { kind: 'shared_kanji' }
	| { kind: 'same_deck' }
	| { kind: 'shared_han_viet' };

export interface RelatedWord {
	vocab: Vocabulary;
	relationshipTypes: RelatedWordRelationshipType[];
	/**
	 * 0..1 (higher = stronger relationship)
	 */
	strength: number;
}
