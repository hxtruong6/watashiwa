/**
 * Demo Page for KanjiWord Component
 *
 * Test page for UI/UX of the KanjiWord component
 */
import { getVocabCacheArrayAction } from '@/modules/kanji-word/actions';
import { buildVocabCache } from '@/modules/kanji-word/utils';
import { Suspense } from 'react';

import { DemoContentClient } from './DemoContentClient';

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
