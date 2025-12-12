import React from 'react';
import { getAdminDeck } from '@/services/admin-actions';
import DeckContentManager from './components/DeckContentManager';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function DeckDetailPage({ params }: PageProps) {
	const { id } = await params;
	const { success, data } = await getAdminDeck(id);

	if (!success || !data) {
		return <div>Deck not found or error loading.</div>;
	}

	return (
		<div>
			<h2 style={{ marginBottom: 8, fontSize: 30, fontWeight: 'bold', color: '#1f1f1f' }}>
				{data.title}
			</h2>
			<div style={{ marginBottom: 24, color: '#666' }}>
				{data.description} {data.isPublic ? '(Public)' : '(Private)'}
			</div>

			<div
				style={{
					background: 'white',
					padding: 24,
					borderRadius: 16,
					boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
				}}
			>
				<DeckContentManager deck={data} />
			</div>
		</div>
	);
}
