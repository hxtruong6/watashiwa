// Added explicit React import if needed, or keeping existing
import { getDeck, getUser, syncUser } from '@/services/actions';
import { notFound } from 'next/navigation';
import React from 'react';

import DeckView from './DeckView';

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Sync User
	await syncUser();
	const user = await getUser();
	const deck = await getDeck(id);

	if (!deck) {
		notFound();
	}

	const isOwner = user?.id === deck.authorId;

	return <DeckView deck={deck} isOwner={isOwner} />;
}
