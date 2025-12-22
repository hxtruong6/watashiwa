/**
 * Course Module - Actions Layer
 *
 * Server Actions for course operations
 */

'use server';

import { getUser } from '@/modules/auth/auth.actions';

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
