/**
 * Story Generation Script
 *
 * Generates stories for units using AI with cost controls and validation
 *
 * Usage: pnpm tsx scripts/generate_stories.ts [unitIds...]
 * Example: pnpm tsx scripts/generate_stories.ts unit-1 unit-2
 */
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { z } from 'zod';

import { StoryContentSchema } from '../src/lib/schemas/jsonb';

const GEN_MODEL = 'gemini-2.5-flash';
const MAX_UNITS_PER_RUN = 10; // Cost control
const RATE_LIMIT_DELAY = 2000; // 2 seconds between API calls

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const prisma = new PrismaClient();

// Helper to generate content with rate limiting
async function callGemini(prompt: string): Promise<string> {
	const response = await genAI.models.generateContent({
		model: GEN_MODEL,
		contents: prompt,
		config: { responseMimeType: 'application/json' },
	});
	return response.text?.toString() || '';
}

// Delay helper for rate limiting
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate story for a unit
 */
async function generateStoryForUnit(unitId: string): Promise<void> {
	console.log(`\n📖 Generating story for unit: ${unitId}`);

	// 1. Fetch unit (deck) and its vocabularies
	const deck = await prisma.deck.findUnique({
		where: { id: unitId },
		include: {
			vocabularies: {
				where: {
					contentStatus: { in: ['VERIFIED', 'PUBLISHED'] },
				},
				take: 15, // Limit to 15 words for story
				select: {
					id: true,
					wordSurface: true,
					wordReading: true,
					meanings: true,
				},
			},
		},
	});

	if (!deck) {
		console.error(`❌ Deck not found: ${unitId}`);
		return;
	}

	if (deck.vocabularies.length === 0) {
		console.warn(`⚠️  No vocabularies found for unit: ${unitId}`);
		return;
	}

	console.log(`   Found ${deck.vocabularies.length} vocabularies`);

	// 2. Prepare vocabulary list for prompt
	const vocabList = deck.vocabularies.map((v) => {
		const meanings = v.meanings as any;
		return {
			id: v.id,
			word: v.wordSurface,
			reading: v.wordReading,
			meaning: meanings.en?.[0] || meanings.vi?.[0] || 'Unknown',
		};
	});

	// 3. Generate story using AI
	const prompt = `
You are a Japanese language learning content creator. Write a short, engaging story (100-150 words) that naturally incorporates the following Japanese vocabulary words.

VOCABULARY WORDS TO INCLUDE:
${vocabList.map((v, i) => `${i + 1}. ${v.word} (${v.reading}) - ${v.meaning}`).join('\n')}

REQUIREMENTS:
1. Write in "Mixed Language" format: Use English grammar and structure, but naturally include Japanese nouns/verbs where appropriate.
2. The story should be engaging and contextually meaningful (not just a list of words).
3. ALL ${vocabList.length} words must appear in the story.
4. Keep the story between 100-150 words.
5. Make it suitable for language learners (clear context, relatable scenarios).

OUTPUT FORMAT (strict JSON):
{
  "title": {
    "en": "Story Title in English",
    "vi": "Tiêu đề câu chuyện bằng tiếng Việt"
  },
  "body_text": "The full story text here. Use {1}, {2}, etc. as placeholders for highlighted words.",
  "highlights": [
    {
      "vocab_id": "${vocabList[0].id}",
      "word_surface": "${vocabList[0].word}",
      "start_index": 14,
      "length": ${vocabList[0].word.length}
    }
  ]
}

IMPORTANT:
- "body_text" should be the complete story text WITHOUT placeholders
- "highlights" array must contain exactly ${vocabList.length} entries
- Each highlight must have the correct "start_index" (character position where the word appears in body_text)
- "start_index" is 0-based
- "length" is the number of characters in the word
`;

	try {
		// Rate limiting
		await delay(RATE_LIMIT_DELAY);

		console.log('   Calling AI...');
		const jsonString = await callGemini(prompt);
		const rawData = JSON.parse(jsonString || '{}');

		// 4. Validate with Zod schema
		console.log('   Validating content...');
		const validation = StoryContentSchema.safeParse(rawData);

		if (!validation.success) {
			console.error(`❌ Validation failed for unit ${unitId}:`, validation.error);
			return;
		}

		const storyContent = validation.data;

		// 5. Verify all words are present
		const includedVocabIds = storyContent.highlights.map((h) => h.vocab_id);
		const requiredVocabIds = vocabList.map((v) => v.id);
		const missingWords = requiredVocabIds.filter((id) => !includedVocabIds.includes(id));

		if (missingWords.length > 0) {
			console.error(
				`❌ Missing words in story for unit ${unitId}:`,
				missingWords.map((id) => vocabList.find((v) => v.id === id)?.word),
			);
			return;
		}

		// 6. Check if story already exists
		const existingStory = await prisma.story.findFirst({
			where: { unitId: deck.id },
		});

		if (existingStory) {
			console.log(`   ⚠️  Story already exists for unit ${unitId}, updating...`);
			await prisma.story.update({
				where: { id: existingStory.id },
				data: {
					content: storyContent,
					contentStatus: 'AI_GENERATED',
				},
			});
			console.log(`   ✅ Story updated for unit: ${unitId}`);
		} else {
			await prisma.story.create({
				data: {
					unitId: deck.id,
					content: storyContent,
					contentStatus: 'AI_GENERATED',
				},
			});
			console.log(`   ✅ Story created for unit: ${unitId}`);
		}
	} catch (error) {
		console.error(`❌ Error generating story for unit ${unitId}:`, error);
	}
}

/**
 * Main function
 */
async function main() {
	const unitIds = process.argv.slice(2);

	if (unitIds.length === 0) {
		console.error('Usage: pnpm tsx scripts/generate_stories.ts <unitId1> [unitId2] ...');
		console.error('Example: pnpm tsx scripts/generate_stories.ts uuid-1 uuid-2');
		process.exit(1);
	}

	if (unitIds.length > MAX_UNITS_PER_RUN) {
		console.error(`❌ Maximum ${MAX_UNITS_PER_RUN} units per run. You provided ${unitIds.length}.`);
		process.exit(1);
	}

	console.log(`🚀 Generating stories for ${unitIds.length} unit(s)...`);

	for (const unitId of unitIds) {
		await generateStoryForUnit(unitId);
	}

	console.log('\n✅ Story generation complete!');
	await prisma.$disconnect();
}

// Run if called directly
if (require.main === module) {
	main().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { generateStoryForUnit };
