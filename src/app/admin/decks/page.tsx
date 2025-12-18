import { getAdminDecks } from '@/services/admin-actions';
import React from 'react';

import AdminDeckTable from './components/AdminDeckTable';

export const dynamic = 'force-dynamic';

export default async function AdminDecksPage() {
	const { success, data } = await getAdminDecks();

	if (!success || !data) {
		return <div>Error loading decks.</div>;
	}

	return (
		<div>
			<h2 style={{ marginBottom: 32, fontSize: 30, fontWeight: 'bold', color: '#1f1f1f' }}>
				Deck Management
			</h2>

			<div
				style={{
					background: 'white',
					padding: 24,
					borderRadius: 16,
					boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
				}}
			>
				<AdminDeckTable initialDecks={data as any} />
			</div>
		</div>
	);
}
