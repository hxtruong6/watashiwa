/**
 * Course Module - Data Layer
 *
 * Handles all Prisma queries for Course operations
 */
import { prisma } from '@/lib/db';

/**
 * Fetch a course with its decks and counts
 */
export async function getCourseById(id: string) {
	return await prisma.course.findUnique({
		where: { id },
		include: {
			author: {
				select: { name: true, id: true },
			},
			decks: {
				include: {
					deck: {
						include: {
							author: { select: { name: true } },
							_count: {
								select: { vocabularies: true, stories: true }, // FIXED: Use correct field names
							},
						},
					},
				},
				orderBy: { sortOrder: 'asc' },
			},
		},
	});
}

/**
 * Fetch a course with user progress on each deck
 */
export async function getCourseWithProgress(courseId: string, userId: string) {
	// 1. Fetch course with decks
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		include: {
			author: { select: { name: true, id: true } },
			decks: {
				include: {
					deck: {
						include: {
							author: { select: { name: true } },
							_count: {
								select: { vocabularies: true, stories: true }, // FIXED
							},
						},
					},
				},
				orderBy: { sortOrder: 'asc' },
			},
		},
	});

	if (!course) return null;

	// 2. Fetch user progress for each deck
	const decksWithProgress = await Promise.all(
		course.decks.map(async (cd) => {
			const deckId = cd.deckId;
			const totalItems = cd.deck._count.vocabularies + cd.deck._count.stories;

			// Count user reviews for this deck
			const userReviews = await prisma.userReview.findMany({
				where: {
					userId: userId,
					vocab: { deckId },
				},
				select: { srsStage: true },
			});

			const startedCount = userReviews.length;
			// Consider "mastered" as Review state (srsStage >= 2)
			const masteredCount = userReviews.filter((r) => r.srsStage >= 2).length;

			return {
				...cd,
				deck: {
					...cd.deck,
					stats: {
						total: totalItems,
						started: startedCount,
						mastered: masteredCount,
						progress: totalItems > 0 ? Math.round((masteredCount / totalItems) * 100) : 0,
					},
				},
			};
		}),
	);

	return {
		...course,
		decks: decksWithProgress,
	};
}

/**
 * Fetch all courses with optional filters
 */
export async function getCourses(options?: { userId?: string; isPublic?: boolean }) {
	const whereClause: {
		OR?: Array<{ isPublic: boolean } | { authorId: string }>;
		isPublic?: boolean;
	} = {};

	if (options?.userId) {
		// Return public courses OR user's own courses
		whereClause.OR = [{ isPublic: true }, { authorId: options.userId }];
	} else if (options?.isPublic !== undefined) {
		whereClause.isPublic = options.isPublic;
	}

	const courses = await prisma.course.findMany({
		where: whereClause,
		include: {
			_count: {
				select: { decks: true },
			},
			author: {
				select: { name: true, id: true },
			},
		},
		orderBy: { updatedAt: 'desc' },
	});

	// Sort: public admin courses first (suggestions), then user's own
	if (options?.userId) {
		return courses.sort((a, b) => {
			const aIsPublic = a.isPublic && a.authorId !== options.userId;
			const bIsPublic = b.isPublic && b.authorId !== options.userId;
			if (aIsPublic && !bIsPublic) return -1;
			if (!aIsPublic && bIsPublic) return 1;
			return 0;
		});
	}

	return courses;
}

/**
 * Search decks available to user
 */
export async function searchDecks(query: string, userId: string) {
	return await prisma.deck.findMany({
		where: {
			AND: [
				{
					OR: [
						{ title: { contains: query, mode: 'insensitive' } },
						{ description: { contains: query, mode: 'insensitive' } },
					],
				},
				{
					OR: [{ isPublic: true }, { authorId: userId }],
				},
			],
		},
		take: 20,
		include: {
			author: { select: { name: true } },
			_count: { select: { vocabularies: true, stories: true } }, // FIXED
		},
	});
}
