import React from 'react';
import { getDeck, syncUser } from '@/services/actions';
import { notFound } from 'next/navigation';
import DeckView from './DeckView';

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Sync User
	await syncUser();
	const deck = await getDeck(id);

	if (!deck) {
		notFound();
	}

	return <DeckView deck={deck} />;
}
