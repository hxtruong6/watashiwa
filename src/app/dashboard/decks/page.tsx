import MyDecksList from '@/components/dashboard/MyDecksList';
import { getUserDecksWithStats } from '@/services/user-content-actions';
import React from 'react';

export default async function MyDecksPage() {
	const { learningDecks, createdDecks } = await getUserDecksWithStats();

	return <MyDecksList learningDecks={learningDecks} createdDecks={createdDecks} />;
}
