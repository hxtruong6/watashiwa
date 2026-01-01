// ❯ npx tsx prisma/seed_confusions.ts
import { ConfusionType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { prisma } from '../src/lib/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../scripts/confusion_pair.json');

interface ConfusionJsonItem {
	vocabId1: string; // This is actually the surface form in the JSON
	vocabId2: string; // This is actually the surface form in the JSON
	type: ConfusionType;
	explanation: any;
}

async function seedConfusions() {
	console.log('🛡️ Starting Interference Shield Seeding from JSON...');

	if (!fs.existsSync(DATA_PATH)) {
		console.error(`❌ Data file not found at: ${DATA_PATH}`);
		return;
	}

	const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
	const pairs: ConfusionJsonItem[] = JSON.parse(rawData);

	console.log(`Found ${pairs.length} pairs to process.`);

	for (const item of pairs) {
		await upsertPair(item);
	}

	console.log('✅ Seeding complete.');
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
