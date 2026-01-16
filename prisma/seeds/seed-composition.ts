/**
 * Composition Seeding Script
 *
 * Seeds the KanjiComposition table by analyzing existing Vocabulary items
 *
 * Usage:
 *   pnpm tsx scripts/seed-composition.ts
 *
 * Prerequisites:
 *   - Kanji table must be seeded first
 *   - Vocabulary table must have words with kanji
 */
import { prisma } from '../../src/lib/db';
import { matchKanjiReadings } from '../../src/lib/utils/reading-matcher';

/**
 * Extract kanji characters from a word
 */
function extractKanji(word: string): string[] {
	// Match any kanji character (CJK Unified Ideographs)
	const kanjiRegex = /[\u4e00-\u9faf]/g;
	return word.match(kanjiRegex) || [];
}

async function seedComposition() {
	console.log('Starting composition seeding...');

	try {
		// Query all Vocabulary items with kanji
		const words = await prisma.vocabulary.findMany({
			where: {
				wordSurface: {
					not: null,
				},
			},
			select: {
				id: true,
				wordSurface: true,
				wordReading: true,
				tags: true,
			},
		});

		console.log(`Found ${words.length} words to process`);

		let processed = 0;
		let created = 0;
		let errors = 0;

		// Process words in batches
		const batchSize = 100;
		for (let i = 0; i < words.length; i += batchSize) {
			const batch = words.slice(i, i + batchSize);

			for (const word of batch) {
				if (!word.wordSurface) continue;

				const kanjiChars = extractKanji(word.wordSurface);

				if (kanjiChars.length === 0) {
					continue; // Skip words without kanji
				}

				for (let pos = 0; pos < kanjiChars.length; pos++) {
					const kanjiChar = kanjiChars[pos];

					try {
						// Find kanji in database
						const kanjiData = await prisma.kanji.findUnique({
							where: { character: kanjiChar },
						});

						if (!kanjiData) {
							console.warn(`Kanji not found: ${kanjiChar} in word ${word.wordSurface}`);
							errors++;
							continue;
						}

						// Match reading
						const match = matchKanjiReadings(
							word.wordReading || '',
							kanjiData.onyomiReadings,
							kanjiData.kunyomiReadings,
							pos,
						);

						// Create composition record
						await prisma.kanjiComposition.create({
							data: {
								wordId: word.id,
								kanjiId: kanjiData.id,
								position: pos + 1, // 1-indexed
								activeReading: match.reading,
								readingType: match.type,
							},
						});

						created++;
					} catch (error) {
						// Handle unique constraint violations (already exists)
						if (error instanceof Error && error.message.includes('Unique constraint')) {
							// Skip - already exists
							continue;
						}
						console.error(`Error processing ${kanjiChar} in ${word.wordSurface}:`, error);
						errors++;
					}
				}

				processed++;
				if (processed % 100 === 0) {
					console.log(`Processed ${processed}/${words.length} words...`);
				}
			}
		}

		console.log(`✅ Successfully created ${created} compositions`);
		console.log(`   Processed ${processed} words`);
		if (errors > 0) {
			console.log(`   ⚠️  ${errors} errors encountered`);
		}
	} catch (error) {
		console.error('❌ Error seeding composition:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run if called directly
if (require.main === module) {
	seedComposition()
		.then(() => {
			console.log('Seeding complete');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seeding failed:', error);
			process.exit(1);
		});
}

export { seedComposition };
