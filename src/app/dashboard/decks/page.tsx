import React from 'react';
import { getUserDecksWithStats } from '@/services/user-content-actions';
import MyDecksList from '@/components/dashboard/MyDecksList';

export default async function MyDecksPage() {
	const { learningDecks, createdDecks } = await getUserDecksWithStats();

	return <MyDecksList learningDecks={learningDecks} createdDecks={createdDecks} />;
}
