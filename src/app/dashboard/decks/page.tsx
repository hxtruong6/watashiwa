import MyDecksList from '@/components/dashboard/MyDecksList';
import { getUserDecksWithStats } from '@/modules/deck/deck.actions';
import React from 'react';

export default async function MyDecksPage() {
	const { learningDecks, createdDecks } = await getUserDecksWithStats();

	return <MyDecksList learningDecks={learningDecks} createdDecks={createdDecks} />;
}
