import { getUser } from '@/modules/auth/auth.actions';
import { getUserDecksWithStats } from '@/modules/deck/deck.actions';
import SessionController from '@/modules/study/components/Session/SessionController';
import StudyDashboard from '@/modules/study/components/StudyDashboard';
import {
	getDailyProgress,
	getLastStudySession,
	hasUserStudiedBefore,
} from '@/modules/study/study.actions';
import { redirect } from 'next/navigation';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string | string[] | undefined): value is string {
	if (!value || Array.isArray(value)) return false;
	return UUID_REGEX.test(value);
}

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
	let { deckId, courseId, mode } = resolvedParams;

	// Normalize parameters: handle empty strings and arrays
	// Next.js can return arrays for duplicate params, we take the first one
	if (Array.isArray(deckId)) {
		deckId = deckId[0];
	}
	if (Array.isArray(courseId)) {
		courseId = courseId[0];
	}
	if (Array.isArray(mode)) {
		mode = mode[0];
	}

	// Filter out empty strings (treat as undefined)
	if (deckId === '') deckId = undefined;
	if (courseId === '') courseId = undefined;
	if (mode === '') mode = undefined;

	// Validate UUID parameters
	if (deckId && !isValidUUID(deckId)) {
		// Invalid deckId - redirect to dashboard
		redirect('/study');
	}

	if (courseId && !isValidUUID(courseId)) {
		// Invalid courseId - redirect to dashboard
		redirect('/study');
	}

	// If both deckId and courseId are provided, courseId takes precedence (per docs)
	// This matches the behavior in useStudySession hook
	if (deckId && courseId) {
		deckId = undefined;
	}

	// If deckId or courseId is present, start the session
	if (deckId || courseId) {
		// Check if this is user's first study session for analytics
		// Parallelize independent operations for better performance
		const [hasStudied, dailyProgress] = await Promise.all([
			hasUserStudiedBefore(),
			getDailyProgress(),
		]);
		const isFirstSession = !hasStudied;

		return (
			<SessionController
				deckId={deckId as string | undefined}
				courseId={courseId as string | undefined}
				mode={mode as string | undefined}
				isFirstSession={isFirstSession}
				dueCount={dailyProgress?.dueCount || 0}
			/>
		);
	}

	// If no explicit params, try to resume last session
	try {
		const lastSession = await getLastStudySession();
		if (lastSession?.deckId) {
			redirect(`/study?deckId=${lastSession.deckId}${mode ? `&mode=${mode}` : ''}`);
		}
	} catch (error) {
		// NEXT_REDIRECT is expected when redirect() is called - not a real error
		if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
			// Re-throw redirect errors - they're intentional
			throw error;
		}
		// Only log actual errors
		console.error('Failed to get last study session:', error);
		// Continue to auto-start or show dashboard on error
	}

	try {
		const [dailyProgress, deckData, hasStudied] = await Promise.all([
			getDailyProgress(),
			getUserDecksWithStats(),
			hasUserStudiedBefore(),
		]);
		const { learningDecks } = deckData;

		const dueCount = dailyProgress?.dueCount || 0;
		const hasStudyHistory = learningDecks.length > 0;
		const isFirstSession = !hasStudied;

		// Auto-start session if user has due cards (active user with work to do)
		if (dueCount > 0 && hasStudyHistory) {
			// Start session with all due cards (no deckId = global fetch)
			// This matches the "Golden Path" - one tap to study
			return (
				<SessionController
					deckId={undefined}
					courseId={undefined}
					mode={mode as string | undefined}
					isFirstSession={isFirstSession}
					dueCount={dueCount}
				/>
			);
		}

		// Show dashboard only for:
		// 1. New users (no study history)
		// 2. Users with no due cards (all caught up)
		// 3. Recovery scenario (user needs context before starting)
		const stats = {
			due: dueCount,
			new: dailyProgress?.newCardsToday || 0,
			streak: 0, // TODO: Implement Streak in DB
			accuracy: 0, // TODO: Implement Accuracy in DB
			focusPoints: 0, // TODO: Implement Focus Points in DB
		};

		return <StudyDashboard user={user} stats={stats} recentDecks={learningDecks.slice(0, 3)} />;
	} catch (error) {
		console.error('Failed to load study dashboard:', error);
		// Show error state - redirect to dashboard as fallback
		redirect('/dashboard');
	}
}
