import React from 'react';
import { getUserDecks } from '@/services/user-content-actions';
import MyDecksList from '@/components/dashboard/MyDecksList';

export default async function MyDecksPage() {
	const decks = await getUserDecks();

	return <MyDecksList decks={decks} />;
}
