import { getAdminDeckDetail, getAdminDeckVocabularies } from '@/modules/deck/deck.admin.actions';
import React from 'react';

import DeckContentManager from './components/DeckContentManager';

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DeckDetailPage({ params, searchParams }: PageProps) {
	const { id } = await params;
	const { page = '1', search = '', status = '' } = await searchParams;

	const currentPage = Number(page) || 1;

	const [deckRes, vocabRes] = await Promise.all([
		getAdminDeckDetail({ id }),
		getAdminDeckVocabularies({
			deckId: id,
			page: currentPage,
			limit: 20,
			search: search as string,
			status: status as string,
		}),
	]);

	const { success: deckSuccess, data: deck } = deckRes;
	const { success: vocabSuccess, data: vocabResult } = vocabRes;

	if (!deckSuccess || !deck) {
		return <div>Deck not found or error loading.</div>;
	}

	return (
		<div>
			<h2 style={{ marginBottom: 8, fontSize: 30, fontWeight: 'bold', color: '#1f1f1f' }}>
				{deck.title}
			</h2>
			<div style={{ marginBottom: 24, color: '#666' }}>
				{deck.description} {deck.isPublic ? '(Public)' : '(Private)'}
			</div>

			<div
				style={{
					background: 'white',
					padding: 24,
					borderRadius: 16,
					boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
				}}
			>
				<DeckContentManager
					deck={deck}
					vocabularies={vocabResult?.data || []}
					total={vocabResult?.total || 0}
					currentPage={currentPage}
					searchParams={{
						search: search as string,
						status: status as string,
					}}
				/>
			</div>
		</div>
	);
}
