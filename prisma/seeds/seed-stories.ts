/**
 * Story Seeding Script (JSON Import)
 *
 * Seeds the Story and StoryVocabulary tables from JSON files
 * located in the watashiwa_data directory
 *
 * Usage:
 *   pnpm tsx prisma/seeds/seed-stories.ts --folder /path/to/stories/folder
 *
 * Examples:
 *   pnpm tsx prisma/seeds/seed-stories.ts --folder /Users/xuantruong/Documents/WORK/SIDE_PROJECTS/watashiwa_data/data/seed/stories
 *   pnpm tsx prisma/seeds/seed-stories.ts --folder ./stories --dry-run
 *
 * Options:
 *   --folder <path>    Path to folder containing unit JSON files (required)
 *   --dry-run          Validate without creating records
 */
import { ContentStatus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

import { prisma } from '../../src/lib/db';
import { bulkCreateStoryVocabularies, createStory } from '../../src/modules/priming/data';
import type { StoryContent, StoryPositions } from '../../src/modules/priming/types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StoryJsonHighlight {
	word_surface: string;
	start_index: number;
	length: number;
}

interface StoryJson {
	title: {
		en: string;
		vi: string;
	};
	body_text: {
		en: string;
		vi: string;
		ja: string;
	};
	translation: {
		en: string;
		vi: string;
	};
	highlights: {
		en: StoryJsonHighlight[];
		vi: StoryJsonHighlight[];
		ja: StoryJsonHighlight[];
	};
}

interface TransformedWord {
	wordSurface: string;
	positions: StoryPositions;
	length: number;
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Calculate read time in minutes (estimate: 200 words per minute)
 */
function calculateReadTime(bodyText: string): number {
	const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Transform highlights from JSON format to database format
 */
function transformHighlights(highlights: StoryJson['highlights']): TransformedWord[] {
	const wordMap = new Map<string, TransformedWord>();

	// Process each language
	for (const [lang, highlightsArray] of Object.entries(highlights)) {
		if (!['en', 'vi', 'ja'].includes(lang)) continue;

		for (const highlight of highlightsArray) {
			const { word_surface, start_index, length } = highlight;

			if (!wordMap.has(word_surface)) {
				wordMap.set(word_surface, {
					wordSurface: word_surface,
					positions: { en: [], vi: [], ja: [] },
					length,
				});
			}

			const word = wordMap.get(word_surface)!;
			word.positions[lang as 'en' | 'vi' | 'ja'].push(start_index);
		}
	}

	// Sort positions arrays
	for (const word of wordMap.values()) {
		word.positions.en.sort((a, b) => a - b);
		word.positions.vi.sort((a, b) => a - b);
		word.positions.ja.sort((a, b) => a - b);
	}

	return Array.from(wordMap.values());
}

/**
 * Find vocabulary by word surface in a specific deck
 */
async function findVocabularyByWordSurface(
	wordSurface: string,
	deckId: string,
): Promise<{ id: string; wordReading: string } | null> {
	const vocab = await prisma.vocabulary.findFirst({
		where: {
			wordSurface,
			deckId,
			deletedAt: null,
		},
		select: {
			id: true,
			wordReading: true,
		},
	});

	return vocab ? { id: vocab.id, wordReading: vocab.wordReading } : null;
}

/**
 * Find all decks for debugging
 */
async function getAllDecksForDebugging(): Promise<
	Array<{ id: string; title: string; titleEn: string | null; slug: string }>
> {
	return await prisma.deck.findMany({
		where: {
			deletedAt: null,
		},
		select: {
			id: true,
			title: true,
			titleEn: true,
			slug: true,
		},
		orderBy: {
			titleEn: 'asc',
		},
	});
}

/**
 * Find deck by unit number (e.g., "01" or "1" -> "Minna no Nihongo Unit 1")
 */
async function findDeckByUnitNumber(
	unitNum: string,
	allDecks?: Array<{ id: string; title: string; titleEn: string | null }>,
): Promise<{ id: string; title: string } | null> {
	// Convert to integer to remove leading zeros (e.g., "01" -> "1")
	const unitNumInt = parseInt(unitNum, 10);
	const unitNumPadded = unitNumInt.toString().padStart(2, '0'); // "1" -> "01"

	// Try multiple patterns to match deck titles
	// Priority: exact match first, then variations
	const patterns = [
		`Minna no Nihongo Unit ${unitNumInt}`, // "Minna no Nihongo Unit 1" (most common)
		`Minna no Nihongo Unit ${unitNumPadded}`, // "Minna no Nihongo Unit 01"
		`Unit ${unitNumInt}`, // "Unit 1"
		`Unit ${unitNumPadded}`, // "Unit 01"
		`Unit${unitNumInt}`, // "Unit1" (no space)
		`Unit${unitNumPadded}`, // "Unit01" (no space, padded)
	];

	// If allDecks is provided, search in memory (faster)
	if (allDecks) {
		for (const pattern of patterns) {
			const patternLower = pattern.toLowerCase();
			const deck = allDecks.find((d) => {
				const titleEn = (d.titleEn || '').toLowerCase();
				const title = (d.title || '').toLowerCase();
				// Try exact match first, then contains
				return (
					titleEn === patternLower ||
					title === patternLower ||
					titleEn.includes(patternLower) ||
					title.includes(patternLower)
				);
			});

			if (deck) {
				return { id: deck.id, title: deck.titleEn || deck.title };
			}
		}
	} else {
		// Fallback to database query
		for (const pattern of patterns) {
			const deck = await prisma.deck.findFirst({
				where: {
					OR: [
						{ titleEn: { contains: pattern, mode: 'insensitive' } },
						{ title: { contains: pattern, mode: 'insensitive' } },
					],
					deletedAt: null,
				},
				select: {
					id: true,
					title: true,
					titleEn: true,
				},
			});

			if (deck) {
				return { id: deck.id, title: deck.titleEn || deck.title };
			}
		}
	}

	return null;
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
	folder: string;
	dryRun: boolean;
	unitMappings: Map<string, string>;
	publish: boolean;
} {
	const args = process.argv.slice(2);
	let folder = '';
	let dryRun = false;
	let publish = false;
	const unitMappings = new Map<string, string>();

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--folder' && args[i + 1]) {
			folder = args[i + 1];
			i++;
		} else if (args[i] === '--dry-run') {
			dryRun = true;
		} else if (args[i] === '--publish') {
			publish = true;
		} else if (args[i].startsWith('--unit') && args[i + 1]) {
			// Support --unit01, --unit02, etc.
			const unitNum = args[i].replace('--unit', '');
			unitMappings.set(unitNum, args[i + 1]);
			i++;
		}
	}

	if (!folder) {
		console.error('❌ Error: --folder argument is required');
		console.error(
			'Usage: pnpm tsx prisma/seeds/seed-stories.ts --folder <path> [--unit01 <deck-id>] [--unit02 <deck-id>] ... [--dry-run] [--publish]',
		);
		process.exit(1);
	}

	return { folder, dryRun, unitMappings, publish };
}

// -----------------------------------------------------------------------------
// Main Seeding Logic
// -----------------------------------------------------------------------------

/**
 * Process a single story JSON object
 */
async function processStory(
	storyJson: StoryJson,
	deckId: string,
	order: number,
	dryRun: boolean,
	publish: boolean,
): Promise<{ success: boolean; storyId?: string; vocabCount: number; warnings: string[] }> {
	const warnings: string[] = [];

	try {
		// Generate slug from English title
		const slug = generateSlug(storyJson.title.en);

		// Check if story already exists
		const existingStory = await prisma.story.findUnique({
			where: { slug },
		});

		if (existingStory) {
			console.log(`   ⚠️  Story "${slug}" already exists, skipping...`);
			return {
				success: true,
				storyId: existingStory.id,
				vocabCount: 0,
				warnings: ['Story already exists'],
			};
		}

		// Validate required fields
		if (!storyJson.title?.en || !storyJson.title?.vi) {
			throw new Error('Story must have title.en and title.vi');
		}
		if (!storyJson.body_text?.en || !storyJson.body_text?.vi || !storyJson.body_text?.ja) {
			throw new Error('Story must have body_text.en, body_text.vi, and body_text.ja');
		}
		if (!storyJson.translation?.en || !storyJson.translation?.vi) {
			throw new Error('Story must have translation.en and translation.vi');
		}
		if (!storyJson.highlights) {
			throw new Error('Story must have highlights');
		}

		// Transform content (remove highlights from content)
		const content: StoryContent = {
			title: {
				en: storyJson.title.en,
				vi: storyJson.title.vi,
				// ja not in StoryContent.title (LocalizedStringSchema is en/vi only). Uncomment if schema is extended.
				// ja: storyJson.title.vi,
			},
			body_text: {
				en: storyJson.body_text.en,
				vi: storyJson.body_text.vi,
				ja: storyJson.body_text.ja,
			},
			translation: {
				en: storyJson.translation.en,
				vi: storyJson.translation.vi,
			},
		};

		// Calculate read time from English text
		const readTimeMin = calculateReadTime(storyJson.body_text.en);

		// Create story
		if (dryRun) {
			console.log(`   [DRY RUN] Would create story: ${slug}`);
		} else {
			const story = await createStory({
				slug,
				unitId: deckId,
				order,
				content,
				difficulty: 'N5', // Default, can be extracted from JSON if available
				category: 'daily_life', // Default, can be extracted from JSON if available
				readTimeMin,
				contentStatus: publish ? ContentStatus.PUBLISHED : ContentStatus.AI_GENERATED,
			});

			console.log(`   ✅ Created story: ${slug} (${story.id})`);

			// Transform highlights
			const transformedWords = transformHighlights(storyJson.highlights);

			if (transformedWords.length === 0) {
				warnings.push('No vocabulary words found in highlights');
			}

			// Match vocabularies and create StoryVocabulary records
			const storyVocabularies = [];
			let vocabCount = 0;

			for (const word of transformedWords) {
				// Validate positions don't exceed text length
				const enText = storyJson.body_text.en;
				const viText = storyJson.body_text.vi;
				const jaText = storyJson.body_text.ja;

				const maxEnPos = Math.max(...word.positions.en, -1);
				const maxViPos = Math.max(...word.positions.vi, -1);
				const maxJaPos = Math.max(...word.positions.ja, -1);

				if (maxEnPos + word.length > enText.length) {
					warnings.push(`Position exceeds text length for "${word.wordSurface}" in English text`);
				}
				if (maxViPos + word.length > viText.length) {
					warnings.push(
						`Position exceeds text length for "${word.wordSurface}" in Vietnamese text`,
					);
				}
				if (maxJaPos + word.length > jaText.length) {
					warnings.push(`Position exceeds text length for "${word.wordSurface}" in Japanese text`);
				}

				const vocab = await findVocabularyByWordSurface(word.wordSurface, deckId);

				if (!vocab) {
					warnings.push(`Vocabulary not found: "${word.wordSurface}"`);
					continue;
				}

				storyVocabularies.push({
					storyId: story.id,
					vocabularyId: vocab.id,
					positions: word.positions,
					wordSurface: word.wordSurface,
					wordReading: vocab.wordReading,
					wordLength: word.length,
				});

				vocabCount++;
			}

			// Bulk create story vocabularies
			if (storyVocabularies.length > 0) {
				if (dryRun) {
					console.log(`   [DRY RUN] Would create ${storyVocabularies.length} story vocabularies`);
				} else {
					try {
						await bulkCreateStoryVocabularies(storyVocabularies);
						console.log(`   ✅ Linked ${storyVocabularies.length} vocabularies`);
					} catch (bulkError) {
						const bulkMessage = bulkError instanceof Error ? bulkError.message : 'Unknown error';
						warnings.push(`Failed to create story vocabularies: ${bulkMessage}`);
						console.error(`   ⚠️  Failed to link vocabularies: ${bulkMessage}`);
					}
				}
			} else {
				warnings.push('No vocabularies were linked to this story');
			}

			if (warnings.length > 0) {
				console.log(`   ⚠️  ${warnings.length} warning(s) for this story`);
			}

			return { success: true, storyId: story.id, vocabCount, warnings };
		}

		// Dry run path
		const transformedWords = transformHighlights(storyJson.highlights);
		let vocabCount = 0;
		for (const word of transformedWords) {
			const vocab = await findVocabularyByWordSurface(word.wordSurface, deckId);
			if (vocab) {
				vocabCount++;
			} else {
				warnings.push(`Vocabulary not found: "${word.wordSurface}"`);
			}
		}

		return { success: true, vocabCount, warnings };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error(`   ❌ Error processing story: ${message}`);
		if (error instanceof Error && error.stack) {
			console.error(`   Stack: ${error.stack}`);
		}
		return { success: false, vocabCount: 0, warnings: [message] };
	}
}

/**
 * Process a single unit JSON file
 */
async function processUnitFile(
	filePath: string,
	deckId: string,
	dryRun: boolean,
	publish: boolean,
): Promise<{ storiesCreated: number; vocabLinked: number; warnings: string[] }> {
	console.log(`\n📖 Processing file: ${path.basename(filePath)}`);

	try {
		const content = await fs.readFile(filePath, 'utf-8');
		let stories: StoryJson[];

		try {
			stories = JSON.parse(content);
		} catch (parseError) {
			throw new Error(
				`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
			);
		}

		if (!Array.isArray(stories)) {
			throw new Error('JSON file must contain an array of stories');
		}

		if (stories.length === 0) {
			console.log(`   ⚠️  File contains no stories`);
			return { storiesCreated: 0, vocabLinked: 0, warnings: ['File contains no stories'] };
		}

		console.log(`   Found ${stories.length} story/stories`);

		let storiesCreated = 0;
		let vocabLinked = 0;
		const allWarnings: string[] = [];

		for (let i = 0; i < stories.length; i++) {
			const story = stories[i];
			console.log(`\n   Processing story ${i + 1}/${stories.length}: "${story.title.en}"`);

			const result = await processStory(story, deckId, i, dryRun, publish);

			if (result.success) {
				if (result.storyId) {
					storiesCreated++;
				}
				vocabLinked += result.vocabCount;
				allWarnings.push(...result.warnings);
			}
		}

		return { storiesCreated, vocabLinked, warnings: allWarnings };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error(`❌ Error processing file ${filePath}: ${message}`);
		throw error;
	}
}

/**
 * Main function
 */
async function main() {
	const { folder, dryRun, unitMappings, publish } = parseArgs();

	if (dryRun) {
		console.log('🔍 DRY RUN MODE - No changes will be made to the database\n');
	}

	console.log(`📂 Reading stories from: ${folder}`);

	try {
		// Check if folder exists
		const stats = await fs.stat(folder);
		if (!stats.isDirectory()) {
			throw new Error(`${folder} is not a directory`);
		}

		// Read all JSON files in the folder
		const files = await fs.readdir(folder);
		const jsonFiles = files.filter((f) => f.endsWith('.json')).sort();

		if (jsonFiles.length === 0) {
			console.error(`❌ No JSON files found in ${folder}`);
			process.exit(1);
		}

		console.log(`Found ${jsonFiles.length} JSON file(s)\n`);

		// Fetch all decks first for debugging
		console.log('🔍 Fetching all decks...');
		const allDecks = await getAllDecksForDebugging();
		console.log(`   Found ${allDecks.length} deck(s) in database\n`);

		// Show all decks for debugging
		console.log('📋 All available decks:');
		console.log('='.repeat(80));
		allDecks.forEach((deck, index) => {
			console.log(
				`${(index + 1).toString().padStart(3)}. ${(deck.titleEn || deck.title).padEnd(50)} | ID: ${deck.id} | Slug: ${deck.slug}`,
			);
		});
		console.log('='.repeat(80));
		console.log('');

		// Auto-map units to decks if not manually provided
		console.log('🔍 Auto-mapping units to decks...\n');
		const autoMappedDecks = new Map<string, string>();

		for (const file of jsonFiles) {
			const unitMatch = file.match(/unit(\d+)/i);
			if (!unitMatch) continue;

			const unitNum = unitMatch[1];

			// Skip if manually mapped
			if (unitMappings.has(unitNum)) {
				continue;
			}

			// Try to auto-find deck
			const deck = await findDeckByUnitNumber(unitNum, allDecks);
			if (deck) {
				autoMappedDecks.set(unitNum, deck.id);
				console.log(`   ✅ Auto-mapped unit${unitNum} → ${deck.title} (${deck.id})`);
			} else {
				console.log(`   ⚠️  Could not auto-map unit${unitNum} (no matching deck found)`);
				console.log(
					`      Tried patterns: "Minna no Nihongo Unit ${unitNum}", "Unit ${unitNum}", etc.`,
				);

				// Show potential matches for debugging
				const potentialMatches = allDecks.filter((d) => {
					const titleEn = (d.titleEn || '').toLowerCase();
					const title = (d.title || '').toLowerCase();
					return titleEn.includes(unitNum) || title.includes(unitNum);
				});

				if (potentialMatches.length > 0) {
					console.log(`      Found ${potentialMatches.length} deck(s) containing "${unitNum}":`);
					potentialMatches.slice(0, 5).forEach((d) => {
						console.log(`         - "${d.titleEn || d.title}" (${d.id})`);
					});
					if (potentialMatches.length > 5) {
						console.log(`         ... and ${potentialMatches.length - 5} more`);
					}
				}
			}
		}

		// Merge manual and auto mappings (manual takes precedence)
		const allMappings = new Map([...autoMappedDecks, ...unitMappings]);

		if (allMappings.size === 0) {
			console.log(
				'\n⚠️  No unit mappings found. Use --unit01, --unit02, etc. to manually map units to decks.',
			);
			console.log('   Or ensure decks exist with titles like "Minna no Nihongo Unit 1"\n');
		} else {
			console.log(`\n📦 Using ${allMappings.size} deck mapping(s)\n`);
		}

		// Process each file
		let totalStories = 0;
		let totalVocab = 0;
		const allWarnings: string[] = [];

		for (const file of jsonFiles) {
			const filePath = path.join(folder, file);
			const unitMatch = file.match(/unit(\d+)/i);

			if (!unitMatch) {
				console.log(`⚠️  Skipping ${file} (doesn't match unit pattern)`);
				continue;
			}

			const unitNum = unitMatch[1];
			const deckId = allMappings.get(unitNum);

			if (!deckId) {
				console.log(`\n⚠️  Skipping ${file} (no deck ID found for unit${unitNum})`);
				console.log(`   Use --unit${unitNum} <deck-id> to manually map this unit`);
				continue;
			}

			// Verify deck exists
			const deck = await prisma.deck.findUnique({
				where: { id: deckId },
				select: { id: true, title: true, titleEn: true },
			});

			if (!deck) {
				console.log(`\n⚠️  Skipping ${file} (deck ${deckId} not found)`);
				continue;
			}

			console.log(`\n📦 Processing ${file} with deck: ${deck.titleEn || deck.title} (${deckId})`);

			const result = await processUnitFile(filePath, deckId, dryRun, publish);
			totalStories += result.storiesCreated;
			totalVocab += result.vocabLinked;
			allWarnings.push(...result.warnings);
		}

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('📊 SUMMARY');
		console.log('='.repeat(60));
		console.log(`Stories created: ${totalStories}`);
		console.log(`Vocabularies linked: ${totalVocab}`);
		if (allWarnings.length > 0) {
			console.log(`\n⚠️  Warnings (${allWarnings.length}):`);
			allWarnings.slice(0, 10).forEach((w) => console.log(`   - ${w}`));
			if (allWarnings.length > 10) {
				console.log(`   ... and ${allWarnings.length - 10} more warnings`);
			}
		}
		console.log('='.repeat(60));

		if (dryRun) {
			console.log('\n🔍 This was a dry run. No changes were made.');
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error(`\n❌ Fatal error: ${message}`);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run if executed directly
main().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
