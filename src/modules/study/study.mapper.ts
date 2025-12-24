import { EtymologyData } from '@/lib/schemas/jsonb';
// Assuming this exists or using any for now if not
import { SmartCard } from '@/types/smart-cube';
import { Vocabulary } from '@prisma/client';

// Helper to safely parse JSONB
function parseJsonSafe<T>(json: any): T | null {
	if (!json) return null;
	try {
		return typeof json === 'string' ? JSON.parse(json) : json;
	} catch (e) {
		console.error('JSON Parse Error', e);
		return null;
	}
}

export function mapVocabularyToSmartCard(vocab: any): SmartCard {
	// Type 'any' used for flexibility with Prisma payload
	const etymology = parseJsonSafe<EtymologyData>(vocab.etymology);
	// const meanings = parseJsonSafe<string[]>(vocab.meanings) || [] // Assuming meanings is JSONB or array
	// Prisma often returns array for string[], so handling both cases if needed

	// Safe handling of meanings which might be string[] or JSON
	let meanings: string[] = [];
	if (Array.isArray(vocab.meanings)) {
		meanings = vocab.meanings;
	} else if (typeof vocab.meanings === 'string') {
		// JSON string
		try {
			meanings = JSON.parse(vocab.meanings);
		} catch {}
	} else if (typeof vocab.meanings === 'object') {
		// JSON object (Prisma JsonValue)
		// Check if it has 'vi', 'en' structure or is simple array
		const m = vocab.meanings as any;
		if (Array.isArray(m)) meanings = m;
		else if (m?.en) meanings = [m.en]; // Fallback to English for now if localized
	}

	return {
		id: `card_${vocab.id}`, // Ephemeral Session ID
		vocabId: vocab.id,
		variant: 'BASIC', // Default to Basic for Phase 1
		front: {
			hero: vocab.wordSurface,
			sub: vocab.romaji,
			audio: vocab.audio_url, // Assuming field name
		},
		back: {
			answer: meanings[0] || '???',
			details: {
				han_viet: (vocab.hanViet || '').toUpperCase(),
				kana: vocab.wordReading,
				meanings: meanings,
				etymology: etymology
					? {
							breakdown: etymology.note?.vi || '',
							han_viet: etymology.parts.map((p) => p.han_viet),
							image_url: undefined, // Add if image_url exists in EtymologyData
						}
					: undefined,
			},
		},
	};
}
