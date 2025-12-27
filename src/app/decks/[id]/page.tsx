// Added explicit React import if needed, or keeping existing
import { isUUID } from '@/lib/utils/uuid';
import { getUser, syncUser } from '@/modules/auth/auth.actions';
import { getDeck } from '@/modules/deck/deck.actions';
import { getDeckById } from '@/modules/deck/deck.data';
import { type RedirectType, notFound, redirect } from 'next/navigation';
import React from 'react';

import DeckView from './DeckView';

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Sync User
	await syncUser();
	const user = await getUser();

	if (isUUID(id)) {
		const deck = await getDeckById(id, user?.id || '');
		if (deck?.slug) {
			redirect(`/decks/${deck.slug}`, 'permanent' as RedirectType);
		}
		notFound();
	}

	// Normal slug lookup
	const deck = await getDeck(id);

	if (!deck) {
		notFound();
	}

	const isOwner = user?.id === deck.authorId;

	return <DeckView deck={deck} isOwner={isOwner} />;
}
