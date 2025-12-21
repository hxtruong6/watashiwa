import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { prisma } from '../src/lib/db';
import {
	ConfusionExplanationSchema,
	EtymologySchema,
	ExamplesSchema,
	LocalizedStringSchema,
	MeaningsSchema,
} from '../src/lib/schemas/jsonb';

// Schema Validation reusing existing schemas
const VocabularyItemSchema = z.object({
	kanji: z.string(),
	han_viet: z.string(),
	kana: z.string(),
	romaji: z.string(),
	tags: z.array(z.string()),
	pitch_pattern: z.number().int(),
	pitch_svg_path: z.string(),
	etymology: EtymologySchema,
	meanings: MeaningsSchema,
	examples: ExamplesSchema,
	mnemonic: LocalizedStringSchema.optional(),
	confusions: z
		.array(
			z.object({
				word: z.string(),
				explanation: ConfusionExplanationSchema,
			}),
		)
		.optional(),
});

type VocabularyItem = z.infer<typeof VocabularyItemSchema>;

async function upsertVocabulary(filePath: string) {
	console.log(`Processing: ${filePath}`);

	const content = await fs.readFile(filePath, 'utf-8');
	const rawData = JSON.parse(content);
	const items = z.array(VocabularyItemSchema).parse(rawData);

	// Get Author (Admin)
	const author = await prisma.user.findFirst({
		where: { role: 'ADMIN' }, // Use first admin
	});

	if (!author) {
		throw new Error('No Admin user found to assign as author.');
	}

	// Determine Deck Name from filename
	// e.g. "n5_action_p1.json" -> "N5 Action P1"
	const filename = path.basename(filePath, '.json');
	const deckTitle = filename
		.split('_')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(' ');

	// Find or Create Deck
	let deck = await prisma.deck.findFirst({
		where: { title: deckTitle },
	});

	if (!deck) {
		console.log(`Creating Deck: ${deckTitle}`);
		deck = await prisma.deck.create({
			data: {
				title: deckTitle,
				description: `Imported from ${filename}`,
				authorId: author.id,
				isPublic: true, // Default to true for seeded content? Or false? Let's say false initially.
			},
		});
	}

	// Mapping for second pass (confusion resolution)
	// Key: wordSurface, Value: vocabId
	const vocabMap = new Map<string, string>();
	const confusionsToProcess: {
		vocabId: string;
		confusions: NonNullable<VocabularyItem['confusions']>;
	}[] = [];

	// PASS 1: Upsert Vocabulary
	for (const item of items) {
		// Check if exists in this deck
		const existing = await prisma.vocabulary.findFirst({
			where: {
				deckId: deck.id,
				wordSurface: item.kanji,
				wordReading: item.kana,
			},
		});

		if (existing) {
			if (existing.contentStatus === 'VERIFIED' || existing.contentStatus === 'PUBLISHED') {
				console.log(`Skipping [${item.kanji}]: Status is ${existing.contentStatus}`);
				vocabMap.set(item.kanji, existing.id);
				continue;
			}
			console.log(`Updating [${item.kanji}]`);
			const updated = await prisma.vocabulary.update({
				where: { id: existing.id },
				data: {
					tags: item.tags,
					wordRomaji: item.romaji,
					pitchPattern: item.pitch_pattern,
					pitchSvgPath: item.pitch_svg_path,
					etymology: item.etymology as any, // Json cast
					meanings: item.meanings as any,
					examples: item.examples as any,
					mnemonic: item.mnemonic ? (item.mnemonic as any) : undefined,
					contentStatus: 'DRAFT', // Reset to DRAFT on update? Or keep current? Let's keep current if it was AI_GENERATED/FLAGGED, or explicit update makes it AI_GENERATED? Let's leave status alone unless it was DRAFT. Actually, allow overwriting data implies potentially new content.
					// Let's set to AI_GENERATED if we are updating from seed script
					// contentStatus: 'AI_GENERATED'
				},
			});
			vocabMap.set(item.kanji, updated.id);
			if (item.confusions && item.confusions.length > 0) {
				confusionsToProcess.push({ vocabId: updated.id, confusions: item.confusions });
			}
		} else {
			console.log(`Creating [${item.kanji}]`);
			const created = await prisma.vocabulary.create({
				data: {
					deckId: deck.id,
					wordSurface: item.kanji,
					wordReading: item.kana,
					wordRomaji: item.romaji,
					tags: item.tags,
					pitchPattern: item.pitch_pattern,
					pitchSvgPath: item.pitch_svg_path,
					etymology: item.etymology as any,
					meanings: item.meanings as any,
					examples: item.examples as any,
					mnemonic: item.mnemonic ? (item.mnemonic as any) : undefined,
					contentStatus: 'AI_GENERATED',
				},
			});
			vocabMap.set(item.kanji, created.id);
			if (item.confusions && item.confusions.length > 0) {
				confusionsToProcess.push({ vocabId: created.id, confusions: item.confusions });
			}
		}
	}

	// PASS 2: Upsert Confusions
	console.log('Processing Confusions...');
	for (const { vocabId, confusions } of confusionsToProcess) {
		for (const conf of confusions) {
			const targetId = vocabMap.get(conf.word);

			// Try to find target in DB if not in map (maybe from another deck?)
			// For now, only scoped to current map or simplistic lookup
			let realTargetId = targetId;
			if (!realTargetId) {
				// Determine if we should look globally. schema says confusions are "ConfusionPair".
				// We'll search unique by surface broadly? Warning: Homonyms exist.
				// ideally we look for specific word.
				const potentialTarget = await prisma.vocabulary.findFirst({
					where: { wordSurface: conf.word },
				});
				if (potentialTarget) realTargetId = potentialTarget.id;
			}

			if (realTargetId) {
				// Check if confusion exists
				const existingConf = await prisma.confusionPair.findFirst({
					where: {
						OR: [
							{ vocabId1: vocabId, vocabId2: realTargetId },
							{ vocabId1: realTargetId, vocabId2: vocabId },
						],
					},
				});

				if (!existingConf) {
					console.log(`Linking confusion: ${vocabId} <-> ${realTargetId}`);
					await prisma.confusionPair.create({
						data: {
							vocabId1: vocabId,
							vocabId2: realTargetId,
							explanation: conf.explanation as any,
							type: 'HOMONYM', // Default or infer?
							// Data usually doesn't specify type in "confusions" array in JSON,
							// maybe add logic or default. JSON schema has explanation but not type explicitly in the array object?
							// checking schema... schema says "word" and "explanation".
						},
					});
				} else {
					// Update explanation if needed
					// await prisma.confusionPair.update(...)
				}
			} else {
				console.warn(`Could not find confusion target word: ${conf.word}`);
			}
		}
	}
}

async function main() {
	// const files = process.argv.slice(2);
	// if (files.length === 0) {
	// 	console.log('Usage: npx tsx scripts/upsert_vocabulary.ts <file1.json> <file2.json> ...');
	// 	process.exit(1);
	// }

	const folderPath = process.argv.slice(2);
	console.log('folderPath', folderPath);
	if (!folderPath) {
		console.log('Usage: npx tsx scripts/upsert_vocabulary.ts <folderPath>');
		process.exit(1);
	}
	//Folder `data/seed/data`;
	const files = await fs.readdir(folderPath[0]);
	const jsonFiles = files.filter((file) => path.extname(file) === '.json');

	for (const file of jsonFiles) {
		console.log('file', file);
		try {
			await upsertVocabulary(path.join(folderPath[0], file));
		} catch (e) {
			console.error(`Failed to process ${file}:`, e);
		}
	}
}

main();
