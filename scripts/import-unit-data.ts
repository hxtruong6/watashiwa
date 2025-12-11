/**
npx tsx scripts/import-unit-data.ts data/unit16.json
*/
import { prisma } from '../src/lib/db';

import fs from 'fs';
import path from 'path';
import { v7 } from 'uuid';

// Interface matching the JSON file structure
interface RawVocab {
	id: string; // If this exists
	wordSurface: string; // -> wordSurface
	readingKana: string; // -> readingKana
	hanViet: string; // -> hanViet
	meaning: string; // -> meaning
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	kanjiBreakdown: any[]; // -> kanjiBreakdown (Json)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	wordParts?: any[]; // -> wordParts (Json)
	exampleSentence: {
		sentence: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		parts: any[];
		translation: string;
	}; // -> exampleSentence (Json)
	audio?: string; // Sometimes JSON might have this? Or maybe missing. Check mapping.
}

async function main() {
	const unitFile = process.argv[2];
	if (!unitFile) {
		console.error('Please provide a unit file path (e.g. data/unit15.json)');
		process.exit(1);
	}

	const filePath = path.resolve(process.cwd(), unitFile);
	if (!fs.existsSync(filePath)) {
		console.error(`File not found: ${filePath}`);
		process.exit(1);
	}

	console.log(`Reading data from ${filePath}...`);
	const rawData = fs.readFileSync(filePath, 'utf-8');
	const vocabList: RawVocab[] = JSON.parse(rawData);

	console.log(`Found ${vocabList.length} items. Importing...`);

	// Ensure a default deck exists or let user specify. For now, creating a temporary "Imported Deck"
	// In real app, might want to find an existing deck by name or ID.
	const user = await prisma.user.findFirst();
	if (!user) {
		console.error('No user found in DB. Please create a user first.');
		process.exit(1);
	}

	const deckTitle = `Minna no Nihongo - ${path.basename(unitFile, '.json')}`;
	let deck = await prisma.deck.findFirst({
		where: { title: deckTitle, authorId: user.id },
	});

	if (!deck) {
		console.log(`Creating new deck: ${deckTitle}`);
		deck = await prisma.deck.create({
			data: {
				title: deckTitle,
				description: 'Minna no Nihongo Unit 15',
				authorId: user.id,
				isPublic: true,
			},
		});
	} else {
		console.log(`Using existing deck: ${deckTitle}`);
	}

	for (const item of vocabList) {
		// Map JSON fields to Prisma schema
		// Note: Prism Json type accepts JS objects/arrays directly.

		// Check for existing vocab to update or create
		// Using wordSurface + deckId as unique constraint logic? Or just ID if stable?
		// The JSON has UUIDs, let's try to preserve them if possible, or upsert by ID.

		// Construct audio URL if predictable, or leave blank/null if not in JSON.
		// The JSON in the prompt didn't show 'audio' field in the new structure,
		// but the first request showed `src="/Audio/minnamoi/bai15/..."`.
		// If the JSON *doesn't* have audio path, we might need to assume a pattern or leave it null.
		// The simplified JSON example only had `wordSurface`, `readingKana`, etc.

		await prisma.vocab.upsert({
			where: { id: v7() }, // If ID is in JSON, use it.
			update: {
				wordSurface: item.wordSurface,
				readingKana: item.readingKana,
				hanViet: item.hanViet,
				meaning: item.meaning,
				kanjiBreakdown: item.kanjiBreakdown, // Pass array directly
				wordParts: item.wordParts, // Pass array directly
				exampleSentence: item.exampleSentence, // Pass object directly
				deckId: deck.id,
			},
			create: {
				id: v7(), // Optional: use ID from JSON if valid UUID
				wordSurface: item.wordSurface,
				readingKana: item.readingKana,
				hanViet: item.hanViet,
				meaning: item.meaning,
				kanjiBreakdown: item.kanjiBreakdown,
				wordParts: item.wordParts,
				exampleSentence: item.exampleSentence,
				deckId: deck.id,
			},
		});
	}

	console.log('Import completed successfully!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
