import { prisma } from '@/lib/db';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getUser } from '@/modules/auth/auth.actions';
import { getCourseIdBySlug } from '@/modules/course/course.data';
import { getUserDecksWithStats } from '@/modules/deck/deck.actions';
import { getDeckIdBySlug } from '@/modules/deck/deck.data';
import SessionController from '@/modules/study/components/Session/SessionController';
import StudyDashboard from '@/modules/study/components/StudyDashboard';
import {
	getDailyProgress,
	getLastStudySession,
	hasUserStudiedBefore,
} from '@/modules/study/study.actions';
import { hasCompletedSetup } from '@/utils/setup-check';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
	const locale = (await getLocale()) as 'vi' | 'en';
	return generatePageMetadata({
		title: locale === 'vi' ? 'Học tập' : 'Study',
		description:
			locale === 'vi'
				? 'Phiên học từ vựng tiếng Nhật với hệ thống SRS'
				: 'Japanese vocabulary study session with SRS system',
		locale,
		url: '/study',
		noindex: true, // Private page - requires authentication
	});
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string | string[] | undefined): value is string {
	if (!value || Array.isArray(value)) return false;
	return UUID_REGEX.test(value);
}

/**
 * Validate slug format (alphanumeric, hyphens, underscores, max 100 chars)
 * Defensive: prevent injection attacks via malformed slugs
 */
function isValidSlug(value: string | string[] | undefined): value is string {
	if (!value || Array.isArray(value)) return false;
	// Allow alphanumeric, hyphens, underscores, max 100 characters
	const SLUG_REGEX = /^[a-z0-9_-]{1,100}$/i;
	return SLUG_REGEX.test(value);
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

	// Check if user has completed setup (server-side protection)
	const setupCompleted = await hasCompletedSetup(user.id);
	if (!setupCompleted) {
		// Preserve query parameters in redirect URL for return after setup
		const resolvedParams = await searchParams;
		const queryString = new URLSearchParams();
		Object.entries(resolvedParams).forEach(([key, value]) => {
			if (value) {
				if (Array.isArray(value)) {
					value.forEach((v) => queryString.append(key, v));
				} else {
					queryString.set(key, value);
				}
			}
		});
		const returnUrl = `/study${queryString.toString() ? `?${queryString.toString()}` : ''}`;
		redirect(`/profile/setup?returnUrl=${encodeURIComponent(returnUrl)}`);
	}

	const resolvedParams = await searchParams;
	let { deckId, deckSlug, courseId, courseSlug, mode } = resolvedParams;

	// Normalize parameters: handle empty strings and arrays
	// Next.js can return arrays for duplicate params, we take the first one
	if (Array.isArray(deckId)) {
		deckId = deckId[0];
	}
	if (Array.isArray(deckSlug)) {
		deckSlug = deckSlug[0];
	}
	if (Array.isArray(courseId)) {
		courseId = courseId[0];
	}
	if (Array.isArray(courseSlug)) {
		courseSlug = courseSlug[0];
	}
	if (Array.isArray(mode)) {
		mode = mode[0];
	}

	// Filter out empty strings (treat as undefined)
	if (deckId === '') deckId = undefined;
	if (deckSlug === '') deckSlug = undefined;
	if (courseId === '') courseId = undefined;
	if (courseSlug === '') courseSlug = undefined;
	if (mode === '') mode = undefined;

	// Priority: slug > ID
	let targetDeckId: string | undefined = undefined;
	let targetCourseId: string | undefined = undefined;

	// Handle deck: slug takes precedence over ID
	if (deckSlug) {
		// Validate slug format (defensive: prevent injection)
		if (!isValidSlug(deckSlug)) {
			redirect('/study');
		}
		const resolvedDeckId = await getDeckIdBySlug(deckSlug, user.id);
		if (!resolvedDeckId) {
			redirect('/study');
		}
		targetDeckId = resolvedDeckId;
	} else if (deckId) {
		// Validate UUID format
		if (!isValidUUID(deckId)) {
			redirect('/study');
		}
		// Redirect UUID to slug for SEO and consistency
		// Optimize: Only fetch slug, not full deck data
		const resolvedDeckSlug = await prisma.deck
			.findFirst({
				where: {
					id: deckId,
					OR: [{ isPublic: true }, { authorId: user.id }],
				},
				select: { slug: true },
			})
			.then((deck: { slug: string } | null) => deck?.slug || null);

		if (resolvedDeckSlug) {
			const redirectUrl = `/study?deckSlug=${resolvedDeckSlug}${mode ? `&mode=${mode}` : ''}`;
			redirect(redirectUrl);
		}
		targetDeckId = deckId;
	}

	// Handle course: slug takes precedence over ID
	if (courseSlug) {
		// Validate slug format (defensive: prevent injection)
		if (!isValidSlug(courseSlug)) {
			redirect('/study');
		}
		const resolvedCourseId = await getCourseIdBySlug(courseSlug);
		if (!resolvedCourseId) {
			redirect('/study');
		}
		targetCourseId = resolvedCourseId;
	} else if (courseId) {
		// Validate UUID format
		if (!isValidUUID(courseId)) {
			redirect('/study');
		}
		// Redirect UUID to slug for SEO and consistency
		// Optimize: Only fetch slug, not full course data
		const resolvedCourseSlug = await prisma.course
			.findUnique({
				where: { id: courseId },
				select: { slug: true },
			})
			.then((course: { slug: string } | null) => course?.slug || null);

		if (resolvedCourseSlug) {
			const redirectUrl = `/study?courseSlug=${resolvedCourseSlug}${mode ? `&mode=${mode}` : ''}`;
			redirect(redirectUrl);
		}
		targetCourseId = courseId;
	}

	// If both deckId and courseId are provided, courseId takes precedence (per docs)
	// This matches the behavior in useStudySession hook
	if (targetDeckId && targetCourseId) {
		targetDeckId = undefined;
	}

	// Use resolved IDs
	deckId = targetDeckId;
	courseId = targetCourseId;

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
			// Optimize: Only fetch slug, not full deck data
			const resolvedDeckSlug = await prisma.deck
				.findFirst({
					where: {
						id: lastSession.deckId,
						OR: [{ isPublic: true }, { authorId: user.id }],
					},
					select: { slug: true },
				})
				.then((deck: { slug: string } | null) => deck?.slug || null);

			if (resolvedDeckSlug) {
				redirect(`/study?deckSlug=${resolvedDeckSlug}${mode ? `&mode=${mode}` : ''}`);
			} else {
				redirect(`/study?deckId=${lastSession.deckId}${mode ? `&mode=${mode}` : ''}`);
			}
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
