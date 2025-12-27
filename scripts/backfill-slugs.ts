/**
 * Backfill Slugs Script
 *
 * Generates slugs for existing courses and decks that don't have slugs yet.
 * This script should be run after the schema migration to populate slugs for existing records.
 *
 * Usage:
 *   tsx scripts/backfill-slugs.ts
 */
import { prisma } from '@/lib/db';

import { generateSlug } from '../src/lib/utils/slug';

async function backfillCourseSlugs() {
	console.log('Starting course slug backfill...');

	// Get all courses without slugs (shouldn't happen after migration, but handle edge cases)
	// Note: After migration, slug is required, so this query may return empty
	const allCourses = await prisma.course.findMany({
		select: { id: true, title: true, titleEn: true, slug: true },
	});
	const courses = allCourses.filter((c) => !c.slug || c.slug === '');

	console.log(`Found ${courses.length} courses without slugs`);

	if (courses.length === 0) {
		console.log('No courses to backfill.');
		return;
	}

	// Get all existing slugs to ensure uniqueness
	const existingCourses = await prisma.course.findMany({
		select: { slug: true },
	});
	const existingSlugs = existingCourses.map((c) => c.slug).filter(Boolean) as string[];

	let successCount = 0;
	let errorCount = 0;

	for (const course of courses) {
		try {
			const titleToUse = course.titleEn || course.title;
			const slug = generateSlug(titleToUse, existingSlugs);

			await prisma.course.update({
				where: { id: course.id },
				data: { slug },
			});

			// Add to existing slugs for next iteration
			existingSlugs.push(slug);
			successCount++;

			console.log(`✓ Generated slug "${slug}" for course "${course.title}"`);
		} catch (error) {
			errorCount++;
			console.error(`✗ Failed to generate slug for course "${course.title}":`, error);
		}
	}

	console.log(`\nCourse backfill complete: ${successCount} succeeded, ${errorCount} failed`);
}

async function backfillDeckSlugs() {
	console.log('\nStarting deck slug backfill...');

	// Get all decks without slugs (shouldn't happen after migration, but handle edge cases)
	// Note: After migration, slug is required, so this query may return empty
	const allDecks = await prisma.deck.findMany({
		select: { id: true, title: true, titleEn: true, slug: true },
	});
	const decks = allDecks.filter((d) => !d.slug || d.slug === '');

	console.log(`Found ${decks.length} decks without slugs`);

	if (decks.length === 0) {
		console.log('No decks to backfill.');
		return;
	}

	// Get all existing slugs to ensure uniqueness
	const existingDecks = await prisma.deck.findMany({
		select: { slug: true },
	});
	const existingSlugs = existingDecks.map((d) => d.slug).filter(Boolean) as string[];

	let successCount = 0;
	let errorCount = 0;

	for (const deck of decks) {
		try {
			const titleToUse = deck.titleEn || deck.title;
			const slug = generateSlug(titleToUse, existingSlugs);

			await prisma.deck.update({
				where: { id: deck.id },
				data: { slug },
			});

			// Add to existing slugs for next iteration
			existingSlugs.push(slug);
			successCount++;

			console.log(`✓ Generated slug "${slug}" for deck "${deck.title}"`);
		} catch (error) {
			errorCount++;
			console.error(`✗ Failed to generate slug for deck "${deck.title}":`, error);
		}
	}

	console.log(`\nDeck backfill complete: ${successCount} succeeded, ${errorCount} failed`);
}

async function main() {
	try {
		await backfillCourseSlugs();
		await backfillDeckSlugs();
		console.log('\n✅ All backfills completed successfully!');
	} catch (error) {
		console.error('❌ Backfill failed:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
