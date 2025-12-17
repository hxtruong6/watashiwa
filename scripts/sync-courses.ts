import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/db';
import { processUnitFile } from './import-unit-data';
import { ADMIN_USER_ID } from '@/lib/constants';

interface CourseDefinition {
	id: string;
	title: string;
	titleEn: string;
	description: string;
	descriptionEn: string;
	level: string;
	tags: string[];
	deckFilter: string;
	dataDir: string;
	unitRange?: [number, number]; // [Start, End] inclusive
}

const COURSES: CourseDefinition[] = [
	{
		id: 'n5-minna-1',
		title: 'Minna no Nihongo I (N5)',
		titleEn: 'Minna no Nihongo I (N5)',
		description: 'Giáo trình sơ cấp 1. Bao gồm bài 1-25, tương đương trình độ N5.',
		descriptionEn: 'Beginner Textbook 1. Covers Units 1-25, equivalent to JLPT N5 level.',
		level: 'N5',
		tags: ['jlpt', 'n5', 'vocabulary', 'minna', 'book1'],
		deckFilter: 'Minna no Nihongo',
		dataDir: 'data/minna_1',
		unitRange: [1, 25],
	},
	// {
	// 	id: 'n4-minna-2',
	// 	title: 'Minna no Nihongo II (N4)',
	// 	titleEn: 'Minna no Nihongo II (N4)',
	// 	description: 'Giáo trình sơ cấp 2. Bao gồm bài 26-50, tương đương trình độ N4.',
	// 	descriptionEn: 'Beginner Textbook 2. Covers Units 26-50, equivalent to JLPT N4 level.',
	// 	level: 'N4',
	// 	tags: ['jlpt', 'n4', 'vocabulary', 'minna', 'book2'],
	// 	deckFilter: 'Minna no Nihongo',
	// 	dataDir: 'data/minna_2',
	// 	unitRange: [26, 50],
	// },
	// {
	// 	id: 'n3-soumatome',
	// 	title: 'Từ vựng N3 (Soumatome)',
	// 	titleEn: 'N3 Vocabulary (Soumatome)',
	// 	description: 'Luyện thi N3 cấp tốc.',
	// 	descriptionEn: 'Intensive N3 preparation.',
	// 	level: 'N3',
	// 	tags: ['jlpt', 'n3', 'vocabulary'],
	// 	deckFilter: 'Soumatome N3',
	// 	dataDir: 'data/jlpt_n3',
	// },
];

async function main() {
	const targetLevel = process.argv[2]?.toLowerCase();

	if (!targetLevel) {
		console.error('❌ Please provide a course level (e.g. n5, n4, n3)');
		console.log('Available levels:', COURSES.map((c) => c.level.toLowerCase()).join(', '));
		process.exit(1);
	}

	const targetCourse = COURSES.find((c) => c.level.toLowerCase() === targetLevel);

	if (!targetCourse) {
		console.error(`❌ Course definition for level "${targetLevel}" not found.`);
		process.exit(1);
	}

	console.log('🚀 Starting Course Sync for:', targetCourse.titleEn);

	// 1. Get Admin User
	const user = await prisma.user.findFirst();
	if (!user) {
		console.error('❌ No user found. Please run seed first.');
		process.exit(1);
	}

	// 2. Import Data from Directory
	const dataDirPath = path.resolve(process.cwd(), targetCourse.dataDir);
	if (fs.existsSync(dataDirPath)) {
		console.log(`📂 Scanning directory: ${targetCourse.dataDir}`);
		const files = fs.readdirSync(dataDirPath).filter((f) => f.endsWith('.json'));

		if (files.length > 0) {
			console.log(`found ${files.length} data files. Importing...`);
			for (const file of files) {
				const fullPath = path.join(dataDirPath, file);
				await processUnitFile(fullPath, user.id);
			}
		} else {
			console.log('⚠️ Directory exists but is empty of JSON files.');
		}
	} else {
		console.log(`⚠️ Directory not found: ${targetCourse.dataDir} (Skipping import step)`);
	}

	console.log(`\n-----------------------------------`);
	console.log(`Syncing Course Structure...`);

	// 3. Upsert Course
	let course = await prisma.course.findFirst({
		where: {
			OR: [{ title: targetCourse.title }, { titleEn: targetCourse.titleEn }],
			authorId: ADMIN_USER_ID,
		},
	});

	const courseData = {
		title: targetCourse.title,
		titleEn: targetCourse.titleEn,
		description: targetCourse.description,
		descriptionEn: targetCourse.descriptionEn,
		level: targetCourse.level,
		tags: targetCourse.tags,
		isPublic: true,
		authorId: user.id,
	};

	if (course) {
		console.log(`ℹ️ Updating existing course ID: ${course.id}`);
		course = await prisma.course.update({
			where: { id: course.id },
			data: courseData,
		});
	} else {
		console.log(`✨ Creating new course`);
		course = await prisma.course.create({
			data: courseData,
		});
	}

	// 4. Find Matching Decks
	const decks = await prisma.deck.findMany({
		where: {
			OR: [
				{ title: { contains: targetCourse.deckFilter } },
				{ titleEn: { contains: targetCourse.deckFilter } },
			],
		},
	});

	if (decks.length === 0) {
		console.log(`⚠️ No decks found for filter: "${targetCourse.deckFilter}"`);
	} else {
		// 5. Filter & Sort Decks by Unit Number
		const sortedDecks = decks
			.map((d) => {
				const str = d.titleEn || d.title;
				const match = str.match(/(?:Unit|Bài)\s*(\d+)/i) || str.match(/\d+/);
				const unitNum = match ? parseInt(match[1] || match[0], 10) : -1;
				return { ...d, unitNum };
			})
			.filter((d) => {
				if (d.unitNum === -1) return false;
				if (targetCourse.unitRange) {
					return d.unitNum >= targetCourse.unitRange[0] && d.unitNum <= targetCourse.unitRange[1];
				}
				return true;
			})
			.sort((a, b) => a.unitNum - b.unitNum);

		console.log(
			`📚 Found ${sortedDecks.length} matching decks (Range: ${targetCourse.unitRange ? targetCourse.unitRange.join('-') : 'All'}).`,
		);

		// 6. Link Decks
		await prisma.courseDeck.deleteMany({
			where: { courseId: course.id },
		});

		for (let i = 0; i < sortedDecks.length; i++) {
			const deck = sortedDecks[i];

			// Update Deck's global sortOrder
			await prisma.deck.update({
				where: { id: deck.id },
				data: { sortOrder: i + 1 },
			});

			await prisma.courseDeck.create({
				data: {
					courseId: course.id,
					deckId: deck.id,
					sortOrder: i + 1,
				},
			});
		}
		console.log(`✅ Linked ${sortedDecks.length} decks to course & set sortOrder.`);
	}

	console.log('\n🎉 Sync Complete!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
