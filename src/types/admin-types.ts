import type { EtymologyData, ExamplesData, MeaningsData, MnemonicData } from '@/lib/schemas/jsonb';
import type { Vocabulary } from '@prisma/client';

// Extended Type with Strict JSONB checking
export interface ExtendedVocabulary extends Omit<
	Vocabulary,
	'meanings' | 'etymology' | 'examples' | 'mnemonic'
> {
	meanings: MeaningsData;
	etymology: EtymologyData;
	examples: ExamplesData;
	mnemonic: MnemonicData | null;
	confusions?: {
		word: string;
		explanation: {
			mnemonic: { vi: string; en: string };
			item1_nuance: { vi: string; en: string };
			item2_nuance: { vi: string; en: string };
		};
	}[];
}
