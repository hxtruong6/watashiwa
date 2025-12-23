/**
 * Course Module - Actions Layer
 *
 * Server Actions for course operations
 */

'use server';

import { prisma } from '@/lib/db';
import { getUser } from '@/modules/auth/auth.actions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import * as courseData from './course.data';

/**
 * Get course by ID with deck details
 */
export async function getCourseById(id: string) {
	try {
		return await courseData.getCourseById(id);
	} catch (error) {
		console.error('Failed to fetch course:', error);
		return null;
	}
}

/**
 * Get course with user progress on each deck
 */
export async function getCourseWithUserProgress(courseId: string) {
	try {
		const user = await getUser();
		if (!user) return null;

		return await courseData.getCourseWithProgress(courseId, user.id);
	} catch (error) {
		console.error('Failed to fetch course with progress:', error);
		return null;
	}
}

/**
 * Get all courses visible to the current user
 */
export async function getCourses(options?: { isPublic?: boolean }) {
	try {
		const user = await getUser();
		return await courseData.getCourses({
			...options,
			userId: user?.id,
		});
	} catch (error) {
		console.error('Failed to fetch courses:', error);
		return [];
	}
}

/**
 * Search decks available to add to a course
 */
export async function searchDecks(query: string) {
	try {
		const user = await getUser();
		if (!user) return [];

		return await courseData.searchDecks(query, user.id);
	} catch (error) {
		console.error('Failed to search decks:', error);
		return [];
	}
}

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

export type CreateCourseInput = {
	title: string;
	description?: string;
	isPublic?: boolean;
	headerImage?: string;
	level?: string;
	tags?: string[];
};

export type UpdateCourseInput = Partial<CreateCourseInput>;

/**
 * Create a new course
 */
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

/**
 * Update an existing course
 */
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

/**
 * Delete a course
 */
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

/**
 * Add a deck to a course
 */
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
		return { success: false, error: 'Failed to add deck to course' };
	}
}

/**
 * Remove a deck from a course
 */
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

/**
 * Reorder decks within a course
 */
export async function reorderDecks(courseId: string, deckIds: string[]) {
	try {
		if (!IdSchema.safeParse(courseId).success)
			return { success: false, error: 'Invalid Course ID' };

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
