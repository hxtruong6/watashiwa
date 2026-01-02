import MyDecksList from '@/modules/dashboard/components/home/MyDecksList';
import { getUserDecksWithStats } from '@/modules/deck/deck.actions';
import { Skeleton } from 'antd';
import { connection } from 'next/server';
import { Suspense } from 'react';

async function MyDecksContent() {
	await connection();
	const { learningDecks, createdDecks } = await getUserDecksWithStats();

	return <MyDecksList learningDecks={learningDecks} createdDecks={createdDecks} />;
}

export default async function MyDecksPage() {
	return (
		<Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
			<MyDecksContent />
		</Suspense>
	);
}
