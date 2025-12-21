import { QAStats } from '@/components/admin/QA/QAStats';
import { getVocabularyStats } from '@/modules/vocabulary/vocabulary.actions';
import React from 'react';

export async function VocabStatsWidget() {
	const vocabStatsResp = await getVocabularyStats();
	const vocabStats = vocabStatsResp.data || {};

	return <QAStats stats={vocabStats} />;
}
