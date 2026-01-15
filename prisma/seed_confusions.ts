// ❯ npx tsx prisma/seed_confusions.ts
import { ConfusionType, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import { prisma } from '../src/lib/db';

const DATA_FOLDER =
	'/Users/xuantruong/Documents/WORK/SIDE_PROJECTS/watashiwa_data/data/seed/confusion';

interface ConfusionJsonItem {
	vocabId1: string; // This is actually the surface form in the JSON
	vocabId2: string; // This is actually the surface form in the JSON
	type: ConfusionType;
	explanation: Prisma.InputJsonValue;
}

async function seedConfusions() {
	console.log('🛡️ Starting Interference Shield Seeding from folder...');
	console.log(`📁 Reading from: ${DATA_FOLDER}`);

	if (!fs.existsSync(DATA_FOLDER)) {
		console.error(`❌ Data folder not found at: ${DATA_FOLDER}`);
		return;
	}

	// Read all JSON files from the folder
	const files = fs
		.readdirSync(DATA_FOLDER)
		.filter((file) => file.endsWith('.json'))
		.sort();

	if (files.length === 0) {
		console.error(`❌ No JSON files found in: ${DATA_FOLDER}`);
		return;
	}

	console.log(`📄 Found ${files.length} JSON file(s) to process:\n`);

	let allPairs: ConfusionJsonItem[] = [];

	// Process each file
	for (const file of files) {
		const filePath = path.join(DATA_FOLDER, file);
		console.log(`  📖 Reading: ${file}`);

		try {
			const rawData = fs.readFileSync(filePath, 'utf-8');
			const pairs: ConfusionJsonItem[] = JSON.parse(rawData);
			allPairs = allPairs.concat(pairs);
			console.log(`     ✓ Loaded ${pairs.length} pairs from ${file}`);
		} catch (error) {
			console.error(`     ❌ Error reading ${file}:`, error);
		}
	}

	console.log(`\n📊 Total pairs loaded: ${allPairs.length}`);
	console.log(`\n🔄 Processing pairs...\n`);

	// Process all pairs
	for (const item of allPairs) {
		await upsertPair(item);
	}

	console.log('\n✅ Seeding complete.');
}

async function upsertPair(item: ConfusionJsonItem) {
	const { vocabId1: surfaceA, vocabId2: surfaceB, type, explanation } = item;
	const label = `${surfaceA} <-> ${surfaceB}`;

	// 1. Resolve Vocab IDs
	const vocabA = await prisma.vocabulary.findFirst({
		where: { wordSurface: surfaceA },
	});
	const vocabB = await prisma.vocabulary.findFirst({
		where: { wordSurface: surfaceB },
	});

	if (!vocabA || !vocabB) {
		console.warn(
			`⚠️  Missing Vocab for pair ${label}: Found A? ${!!vocabA}, Found B? ${!!vocabB}. Skipping.`,
		);
		return;
	}

	// 2. Check for existing pair (Bidirectional Check)
	const existing = await prisma.confusionPair.findFirst({
		where: {
			OR: [
				{ vocabId1: vocabA.id, vocabId2: vocabB.id },
				{ vocabId1: vocabB.id, vocabId2: vocabA.id },
			],
		},
	});

	if (existing) {
		// UPSERT: Update existing
		console.log(`  ↻ Updating pair: ${label} (${existing.id})`);
		await prisma.confusionPair.update({
			where: { id: existing.id },
			data: {
				explanation, // Update text/nuance
				type, // Update type
			},
		});
	} else {
		// UPSERT: Create new
		const created = await prisma.confusionPair.create({
			data: {
				vocabId1: vocabA.id,
				vocabId2: vocabB.id,
				explanation,
				type,
			},
		});
		console.log(`  + Created Link: ${label} (${created.id})`);
	}
}

seedConfusions()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
