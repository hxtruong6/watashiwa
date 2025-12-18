/**
 * Usage: npx tsx scripts/import-kanji.ts data/kanji_n5.json
 */
import fs from 'fs';
import { v7 } from 'uuid';

import { prisma } from '../src/lib/db';

interface RawKanji {
	kanji: string;
	hanViet: string;
	jlptLevel: string;
	strokes: number;
	radicals: unknown;
	onyomi: string[];
	kunyomi: string[];
	meaningsVi: string[];
	analysisVi: string;
	definitionVi: string;
	examples: unknown;
}

async function main() {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		console.error('Usage: npx tsx scripts/import-kanji.ts <json-file>');
		process.exit(1);
	}

	const filePath = args[0];
	if (!fs.existsSync(filePath)) {
		console.error(`File not found: ${filePath}`);
		process.exit(1);
	}

	const rawData = fs.readFileSync(filePath, 'utf-8');
	const kanjiList: RawKanji[] = JSON.parse(rawData);

	console.log(`Loaded ${kanjiList.length} kanji from ${filePath}`);

	// Ensure there's a default user
	let user = await prisma.user.findFirst();
	if (!user) {
		console.log('No user found, creating default user...');
		user = await prisma.user.create({
			data: {
				email: 'demo@watashi.jp',
				name: 'Demo User',
			},
		});
	}

	// Create a default "Kanji N5" Deck
	const deck = await prisma.deck.create({
		data: {
			title: 'Kanji N5',
			description: 'Basic Kanji for JLPT N5',
			authorId: user.id,
			isPublic: true,
		},
	});
	console.log(`Created deck: ${deck.title} (${deck.id})`);

	for (const item of kanjiList) {
		// 1. Create Kanji
		const kanji = await prisma.kanji.create({
			data: {
				deckId: deck.id,
				kanji: item.kanji,
				hanViet: item.hanViet,
				jlptLevel: item.jlptLevel,
				strokes: item.strokes,
				onyomi: item.onyomi,
				kunyomi: item.kunyomi,
				meaning: item.meaningsVi.join(', '), // Join array to string for simple display
				radicals: item.radicals ?? [],
				examples: item.examples ?? [],
			},
		});

		// 2. Create StudyCard
		// Initial state is New (0)
		await prisma.studyCard.create({
			data: {
				userId: user.id,
				kanjiId: kanji.id,
				state: 0,
				stability: 0,
				difficulty: 0,
				due: new Date(),
			},
		});
	}

	console.log(`✅ Successfully imported ${kanjiList.length} kanji.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
