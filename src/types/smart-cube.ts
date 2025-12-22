export type CardVariantType = 'BASIC' | 'GAP_FILL' | 'INTERVENTION' | 'LISTENING';

export interface SmartCard {
	id: string; // Unique Session Item ID
	vocabId: string;
	variant: CardVariantType;
	front: {
		hero: string; // The big text
		sub?: string;
		audio?: string;
	};
	back: {
		answer: string;
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
		intervention?: {
			type: 'homonym_clash';
			confusing_vocab_id: string;
		};
	};
}
