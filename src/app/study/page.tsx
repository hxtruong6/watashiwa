import { getUser } from '@/modules/auth/auth.actions';
import SessionController from '@/modules/study/components/Session/SessionController';
import StudyDashboard from '@/modules/study/components/StudyDashboard';
import { redirect } from 'next/navigation';

export default async function StudyPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const user = await getUser();

	if (!user) {
		redirect('/login');
	}

	const resolvedParams = await searchParams;
	const { deckId, courseId } = resolvedParams;

	// If deckId or courseId is present, start the session
	if (deckId || courseId) {
		return (
			<SessionController
				deckId={deckId as string | undefined}
				courseId={courseId as string | undefined}
			/>
		);
	}

	// Otherwise show the dashboard
	return <StudyDashboard />;
}
