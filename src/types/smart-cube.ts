export type CardVariantType = 'BASIC' | 'GAP_FILL' | 'INTERVENTION' | 'LISTENING';

export interface SmartCard {
	id: string; // Unique Session Item ID
	vocabId: string;
	variant: CardVariantType;
	front: {
		hero: string; // BASIC: Kanji, GAP_FILL: Sentence with [___]
		sub?: string; // BASIC: Romaji/Meaning key, GAP_FILL: Hint
		audio?: string;
	};
	back: {
		answer: string; // The "Reveal" answer
		// Simplified for now, will expand with real Vocabulary type
		details: {
			han_viet: string;
			kana: string;
			meanings: string[];
			etymology?: {
				han_viet: string[];
				breakdown: string;
				image_url?: string;
			};
		};
		// Payload for GapFill specific logic (if needed beyond front/back)
		gapFill?: {
			sentence_full: string;
			focus_word: string;
		};
		// Payload for Intervention (Quiz Mode)
		intervention?: {
			type: 'homonym_clash';
			confusing_vocab_id: string;
			options: {
				id: string;
				label: string;
				isCorrect: boolean;
				audio?: string;
			}[];
		};
	};
}
