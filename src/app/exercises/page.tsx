'use client';

import { useFeatureDiscovery } from '@/hooks/useFeatureDiscovery';

export const metadata = {
	title: 'Active Recall Exercises | WatashiWa',
	description: 'Practice your vocabulary with active recall exercises.',
};

interface ExercisesPageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default function ExercisesPage({ searchParams }: ExercisesPageProps) {
	useFeatureDiscovery('exercises', 'navigation');
	const deckIdParam = searchParams?.deckId;
	let deckIds: string[] = [];

	if (typeof deckIdParam === 'string') {
		deckIds = deckIdParam.split(',');
	} else if (Array.isArray(deckIdParam)) {
		deckIds = deckIdParam;
	}

	return <main>{/* <ExerciseSessionContainer deckIds={deckIds} /> */}</main>;
}
