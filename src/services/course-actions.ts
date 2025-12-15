'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/services/actions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { z } from 'zod';

const IdSchema = z.string().min(1);

const CreateCourseSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	isPublic: z.boolean().optional(),
	headerImage: z.string().optional(),
	level: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

// --- Types ---

export type CreateCourseInput = {
	title: string;
	description?: string;
	isPublic?: boolean;
	headerImage?: string;
	level?: string;
	tags?: string[];
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

export type CourseWithDecks = Awaited<ReturnType<typeof getCourseById>>;

// --- Actions ---

export async function createCourse(data: CreateCourseInput) {
	try {
		const validation = CreateCourseSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };
		const user = await getUser();
		if (!user) {
			return { success: false, error: 'Unauthorized' };
		}

		const course = await prisma.course.create({
			data: {
				...data,
				authorId: user.id,
			},
		});

		revalidatePath('/dashboard/courses');
		return { success: true, data: course };
	} catch (error) {
		console.error('Failed to create course:', error);
		return { success: false, error: 'Failed to create course' };
	}
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const validation = UpdateCourseSchema.safeParse(data);
		if (!validation.success) return { success: false, error: 'Invalid data' };

		const user = await getUser();
		if (!user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Verify ownership
		const existing = await prisma.course.findUnique({
			where: { id },
			select: { authorId: true },
		});

		if (!existing || existing.authorId !== user.id) {
			return { success: false, error: 'Unauthorized or not found' };
		}

		const course = await prisma.course.update({
			where: { id },
			data,
		});

		revalidatePath('/dashboard/courses');
		revalidatePath(`/courses/${id}`);
		return { success: true, data: course };
	} catch (error) {
		console.error('Failed to update course:', error);
		return { success: false, error: 'Failed to update course' };
	}
}

export async function deleteCourse(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return { success: false, error: 'Invalid ID' };
		const user = await getUser();
		if (!user) {
			return { success: false, error: 'Unauthorized' };
		}

		const existing = await prisma.course.findUnique({
			where: { id },
			select: { authorId: true },
		});

		if (!existing || existing.authorId !== user.id) {
			return { success: false, error: 'Unauthorized or not found' };
		}

		await prisma.course.delete({
			where: { id },
		});

		revalidatePath('/dashboard/courses');
		return { success: true };
	} catch (error) {
		console.error('Failed to delete course:', error);
		return { success: false, error: 'Failed to delete course' };
	}
}

export async function addDeckToCourse(courseId: string, deckId: string) {
	try {
		if (!IdSchema.safeParse(courseId).success || !IdSchema.safeParse(deckId).success) {
			return { success: false, error: 'Invalid IDs' };
		}
		const user = await getUser();
		if (!user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check course ownership
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { authorId: true },
		});

		if (!course || course.authorId !== user.id) {
			return { success: false, error: 'Unauthorized or Course not found' };
		}

		// Determine sort order (append to end)
		const lastDeck = await prisma.courseDeck.findFirst({
			where: { courseId },
			orderBy: { sortOrder: 'desc' },
			select: { sortOrder: true },
		});
		const nextOrder = (lastDeck?.sortOrder ?? -1) + 1;

		const courseDeck = await prisma.courseDeck.create({
			data: {
				courseId,
				deckId,
				sortOrder: nextOrder,
			},
		});

		revalidatePath(`/courses/${courseId}`);
		return { success: true, data: courseDeck };
	} catch (error) {
		console.error('Failed to add deck to course:', error);
		// Handle unique constraint violation (deck already in course)
		if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
			return { success: false, error: 'Deck is already in this course' };
		}
		return { success: false, error: 'Failed to add deck/course' };
	}
}

export async function removeDeckFromCourse(courseId: string, deckId: string) {
	try {
		if (!IdSchema.safeParse(courseId).success || !IdSchema.safeParse(deckId).success) {
			return { success: false, error: 'Invalid IDs' };
		}
		const user = await getUser();
		if (!user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check ownership
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { authorId: true },
		});

		if (!course || course.authorId !== user.id) {
			return { success: false, error: 'Unauthorized' };
		}

		await prisma.courseDeck.delete({
			where: {
				courseId_deckId: {
					courseId,
					deckId,
				},
			},
		});

		revalidatePath(`/courses/${courseId}`);
		return { success: true };
	} catch (error) {
		console.error('Failed to remove deck from course', error);
		return { success: false, error: 'Failed to remove deck' };
	}
}

export async function reorderDecks(courseId: string, deckIds: string[]) {
	try {
		if (!IdSchema.safeParse(courseId).success)
			return { success: false, error: 'Invalid Course ID' };
		// internal deckIds validation or rely on array
		const user = await getUser();
		if (!user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check ownership
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { authorId: true },
		});

		if (!course || course.authorId !== user.id) {
			return { success: false, error: 'Unauthorized' };
		}

		// Transaction to update all
		await prisma.$transaction(
			deckIds.map((deckId, index) =>
				prisma.courseDeck.update({
					where: {
						courseId_deckId: {
							courseId,
							deckId,
						},
					},
					data: { sortOrder: index },
				}),
			),
		);

		revalidatePath(`/courses/${courseId}`);
		return { success: true };
	} catch (error) {
		console.error('Failed to reorder decks', error);
		return { success: false, error: 'Failed to reorder' };
	}
}

// --- Data Fetching ---

export async function getCourses(options?: { userId?: string; isPublic?: boolean }) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const whereClause: any = {};
		if (options?.userId) whereClause.authorId = options.userId;
		if (options?.isPublic !== undefined) whereClause.isPublic = options.isPublic;

		const courses = await prisma.course.findMany({
			where: whereClause,
			include: {
				_count: {
					select: { decks: true },
				},
				author: {
					select: { name: true },
				},
			},
			orderBy: { updatedAt: 'desc' },
		});
		return courses;
	} catch (error) {
		console.error('Failed to fetch courses:', error);
		return [];
	}
}

export async function getCourseById(id: string) {
	try {
		if (!IdSchema.safeParse(id).success) return null;
		const course = await prisma.course.findUnique({
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
									select: { vocab: true, kanji: true },
								},
							},
						},
					},
					orderBy: { sortOrder: 'asc' },
				},
			},
		});
		return course;
	} catch (error) {
		console.error('Failed to fetch course:', error);
		return null;
	}
}

/**
 * NEW: Search all decks (public or owned by user) to link to a course
 */
export async function searchDecks(query: string) {
	try {
		const user = await getUser();
		if (!user) return [];

		const decks = await prisma.deck.findMany({
			where: {
				AND: [
					{
						OR: [
							{ title: { contains: query, mode: 'insensitive' } },
							{ description: { contains: query, mode: 'insensitive' } },
						],
					},
					{
						OR: [{ isPublic: true }, { authorId: user.id }],
					},
				],
			},
			take: 20,
			include: {
				author: { select: { name: true } },
				_count: { select: { vocab: true, kanji: true } },
			},
		});
		return decks;
	} catch (error) {
		console.error('Failed to search decks:', error);
		return [];
	}
}

/**
 * NEW: Fetch Course with detailed User Progress for each Deck
 */
export async function getCourseWithUserProgress(courseId: string) {
	try {
		if (!IdSchema.safeParse(courseId).success) return null;
		const user = await getUser();
		if (!user) return null;

		// 1. Fetch Basic Course + Decks
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			include: {
				author: { select: { name: true, id: true } },
				decks: {
					include: {
						deck: {
							include: {
								author: { select: { name: true } },
								_count: { select: { vocab: true, kanji: true } },
							},
						},
					},
					orderBy: { sortOrder: 'asc' },
				},
			},
		});

		if (!course) return null;

		// 2. Fetch Progress for EACH Deck in the course
		// We need to count StudyCards for this user in each deck
		// This can be N queries or one big aggregation. For simplicity, let's Promise.all
		// since a course usually has < 20 decks.

		const decksWithProgress = await Promise.all(
			course.decks.map(async (cd) => {
				const deckId = cd.deckId;
				const totalItems = cd.deck._count.vocab + cd.deck._count.kanji;

				// Count Started (Any state >= 0)
				// Actually strictly > 0 if we consider 0 as "Unseen"?
				// FSRS: 0=New, 1=Learning, 2=Review, 3=Relearning.
				// "Started" usually means user has created a card (enrolled).
				// If we enroll JIT, 'Started' means card exists.

				const userCards = await prisma.studyCard.findMany({
					where: {
						userId: user.id,
						OR: [{ vocab: { deckId } }, { kanji: { deckId } }],
					},
					select: { state: true },
				});

				const startedCount = userCards.length;
				const masteredCount = userCards.filter((c) => c.state >= 2).length; // Assuming Review phase is "Mastering" or "Learned" enough

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
	} catch (error) {
		console.error('Failed to fetch course with progress:', error);
		return null;
	}
}
