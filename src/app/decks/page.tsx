import React from 'react';
import { getDecks, syncUser } from '@/services/actions';
import DecksContent from '@/components/DecksContent';

export default async function DecksPage() {
	// Sync user on load
	await syncUser();
	const decks = await getDecks();

	return <DecksContent decks={decks} />;
}
