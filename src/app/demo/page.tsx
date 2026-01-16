/**
 * Demo Page for KanjiWord Component
 *
 * Test page for UI/UX of the KanjiWord component
 */
import { getVocabCacheArrayAction } from '@/modules/kanji-word/actions';
import { buildVocabCache } from '@/modules/kanji-word/utils';
import { Suspense } from 'react';

import { DemoContentClient } from './DemoContentClient';

// Test vocabulary data (for standalone testing)
export const testVocabs = [
	{
		id: 'test-1',
		wordSurface: '学校',
		wordReading: 'がっこう',
		wordRomaji: 'gakkou',
		hanViet: 'HỌC HIỆU',
		meanings: { en: ['School'], vi: ['Trường học'] },
		tags: ['n5', 'noun'],
		audioUrl: null,
		etymology: {},
		examples: [],
		mnemonic: null,
		furiganaMapping: null,
		contentStatus: 'PUBLISHED' as const,
		deckId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		wordOrder: 0,
		pitchPattern: null,
		pitchSvgPath: null,
		homonymGroupId: null,
		imageUrl: null,
		verifiedAt: null,
		verifiedBy: null,
	},
	{
		id: 'test-2',
		wordSurface: '行きます',
		wordReading: 'いきます',
		wordRomaji: 'ikimasu',
		hanViet: 'HÀNH',
		meanings: { en: ['To go'], vi: ['Đi'] },
		tags: ['n5', 'verb'],
		audioUrl: null,
		etymology: {},
		examples: [],
		mnemonic: null,
		furiganaMapping: null,
		contentStatus: 'PUBLISHED' as const,
		deckId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		wordOrder: 0,
		pitchPattern: null,
		pitchSvgPath: null,
		homonymGroupId: null,
		imageUrl: null,
		verifiedAt: null,
		verifiedBy: null,
	},
	{
		id: 'test-3',
		wordSurface: '休みます',
		wordReading: 'やすみます',
		wordRomaji: 'yasumimasu',
		hanViet: 'HƯU',
		meanings: { en: ['To rest', 'To take a break'], vi: ['Nghỉ ngơi'] },
		tags: ['n5', 'verb'],
		audioUrl: null,
		etymology: {},
		examples: [],
		mnemonic: null,
		furiganaMapping: null,
		contentStatus: 'PUBLISHED' as const,
		deckId: '',
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		wordOrder: 0,
		pitchPattern: null,
		pitchSvgPath: null,
		homonymGroupId: null,
		imageUrl: null,
		verifiedAt: null,
		verifiedBy: null,
	},
];

async function DemoContent() {
	// Fetch vocab cache from server
	let vocabCache = new Map();
	try {
		const vocabCacheResult = await getVocabCacheArrayAction({ limit: 1000 });
		if (vocabCacheResult.success && vocabCacheResult.data) {
			vocabCache = buildVocabCache(vocabCacheResult.data);
		}
	} catch (error) {
		console.error('Failed to load vocab cache:', error);
		// Continue with empty cache for demo
	}

	// Convert Map to array for serialization
	const vocabCacheArray = Array.from(vocabCache.entries());

	return <DemoContentClient vocabCacheArray={vocabCacheArray} />;
}

export default function DemoPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DemoContent />
		</Suspense>
	);
}
