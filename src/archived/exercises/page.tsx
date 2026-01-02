'use client';

import { useFeatureDiscovery } from '@/hooks/useFeatureDiscovery';

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
