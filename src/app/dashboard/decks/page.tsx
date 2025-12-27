import MyDecksList from '@/modules/dashboard/components/home/MyDecksList';
import { getUserDecksWithStats } from '@/modules/deck/deck.actions';
import React from 'react';

// Force dynamic rendering - this page uses cookies for authentication
export const dynamic = 'force-dynamic';

export default async function MyDecksPage() {
	const { learningDecks, createdDecks } = await getUserDecksWithStats();

	return <MyDecksList learningDecks={learningDecks} createdDecks={createdDecks} />;
}
