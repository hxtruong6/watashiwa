/**
npx tsx scripts/import-unit-data.ts data/unit16.json
*/
import { prisma } from '../src/lib/db';

import fs from 'fs';
import path from 'path';
import { v7, v5 as uuidv5 } from 'uuid';
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Interface matching the JSON file structure
interface RawVocab {
	id: string; // If this exists
	wordSurface: string; // -> wordSurface
	readingKana: string; // -> readingKana
	hanViet: string; // -> hanViet
	meaning: string; // -> meaning
	enMeaning?: string; // -> enMeaning
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	kanjiBreakdown: any[]; // -> kanjiBreakdown (Json)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	wordParts?: any[]; // -> wordParts (Json)
	exampleSentence: {
		sentence: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		parts?: any[];
		translation: string;
		enTranslation?: string;
	}; // -> exampleSentence (Json)
	audio?: string; // Sometimes JSON might have this? Or maybe missing. Check mapping.
}

export async function processUnitFile(filePath: string, userId: string) {
	if (!fs.existsSync(filePath)) {
		console.error(`File not found: ${filePath}`);
		return;
	}

	console.log(`Reading data from ${filePath}...`);
	const rawData = fs.readFileSync(filePath, 'utf-8');
	const vocabList: RawVocab[] = JSON.parse(rawData);

	console.log(`Found ${vocabList.length} items. Importing...`);

	const unitNumberMatch = filePath.match(/unit(\d+)\.json$/);
	const unitNumber = unitNumberMatch ? unitNumberMatch[1] : '??';

	// Handle 01, 02... by parsing to int if needed, but string '01' is fine for titles
	// Actually, let's keep it as is for title consistencies created by shell script

	const deckTitleEn = `Minna no Nihongo Unit ${unitNumber}`;
	const deckTitleVn = `Minna no Nihongo Bài ${unitNumber}`;
	const deckDescriptionEn = `Vocabulary for Unit ${unitNumber}`;
	const deckDescriptionVn = `Từ vựng bài ${unitNumber}`;

	// Find existing deck by EN or VN title
	let deck = await prisma.deck.findFirst({
		where: {
			OR: [{ title: deckTitleVn }, { titleEn: deckTitleEn }],
			authorId: userId,
		},
	});

	if (!deck) {
		console.log(`Creating new deck: ${deckTitleEn} / ${deckTitleVn}`);
		deck = await prisma.deck.create({
			data: {
				title: deckTitleVn,
				titleEn: deckTitleEn,
				description: deckDescriptionVn,
				descriptionEn: deckDescriptionEn,
				authorId: userId,
				isPublic: true,
			},
		});
	} else {
		console.log(`Using existing deck: ${deck.titleEn || deck.title}`);
		// Update missing EN fields if needed
		if (!deck.titleEn || !deck.descriptionEn) {
			console.log('Updating missing localized fields...');
			deck = await prisma.deck.update({
				where: { id: deck.id },
				data: {
					titleEn: deck.titleEn || deckTitleEn,
					descriptionEn: deck.descriptionEn || deckDescriptionEn,
				},
			});
		}
	}

	for (const item of vocabList) {
		const deterministicId = item.id ? uuidv5(item.id, UUID_NAMESPACE) : v7();
		await prisma.vocab.upsert({
			where: { id: deterministicId },
			update: {
				wordSurface: item.wordSurface,
				readingKana: item.readingKana,
				hanViet: item.hanViet,
				meaning: item.meaning,
				enMeaning: item.enMeaning,
				kanjiBreakdown: item.kanjiBreakdown,
				wordParts: item.wordParts,
				exampleSentence: item.exampleSentence,
				deckId: deck.id,
			},
			create: {
				id: deterministicId,
				wordSurface: item.wordSurface,
				readingKana: item.readingKana,
				hanViet: item.hanViet,
				meaning: item.meaning,
				enMeaning: item.enMeaning,
				kanjiBreakdown: item.kanjiBreakdown || [],
				wordParts: item.wordParts,
				exampleSentence: item.exampleSentence,
				deckId: deck.id,
			},
		});
	}

	console.log(`Import completed for ${path.basename(filePath)}`);
}

import { fileURLToPath } from 'url';

async function main() {
	// Only run if called directly (ESM equivalent)
	const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
	if (isMainModule) {
		const unitFile = process.argv[2];
		if (!unitFile) {
			console.error('Please provide a unit file path (e.g. data/unit15.json)');
			process.exit(1);
		}

		const filePath = path.resolve(process.cwd(), unitFile);

		const user = await prisma.user.findFirst();
		if (!user) {
			console.error('No user found in DB. Please create a user first.');
			process.exit(1);
		}

		await processUnitFile(filePath, user.id);
		await prisma.$disconnect();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
