import ExerciseSessionContainer from '@/components/Study/Exercises/ExerciseSessionContainer';

export const metadata = {
	title: 'Active Recall Exercises | WatashiWa',
	description: 'Practice your vocabulary with active recall exercises.',
};

interface ExercisesPageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ExercisesPage({ searchParams }: ExercisesPageProps) {
	const deckIdParam = searchParams?.deckId;
	let deckIds: string[] = [];

	if (typeof deckIdParam === 'string') {
		deckIds = deckIdParam.split(',');
	} else if (Array.isArray(deckIdParam)) {
		deckIds = deckIdParam;
	}

	return (
		<main>
			<ExerciseSessionContainer deckIds={deckIds} />
		</main>
	);
}
