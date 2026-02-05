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

import { MeaningsSchema, StoryContentSchema } from '../src/lib/schemas/jsonb';
import { generateSlug } from '../src/lib/utils/slug';

const GEN_MODEL = 'gemini-2.5-flash';
const MAX_UNITS_PER_RUN = 10; // Cost control
const RATE_LIMIT_DELAY = 2000; // 2 seconds between API calls
const MAX_VOCAB_PER_STORY = 15; // Maximum vocabulary words per story for quality

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
				// Don't limit here - we'll split into multiple stories if needed
				select: {
					id: true,
					wordSurface: true,
					wordReading: true,
					meanings: true,
				},
				orderBy: {
					wordOrder: 'asc', // Use word order for consistent splitting
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

	// 2. Prepare vocabulary list
	const allVocabList = deck.vocabularies.map((v) => {
		const meaningsParsed = MeaningsSchema.safeParse(v.meanings);
		const meanings = meaningsParsed.success ? meaningsParsed.data : { en: [], vi: [] };
		return {
			id: v.id,
			word: v.wordSurface,
			reading: v.wordReading,
			meaning: meanings.en?.[0] || meanings.vi?.[0] || 'Unknown',
		};
	});

	// 3. Split vocabulary into chunks if needed
	const vocabChunks: (typeof allVocabList)[] = [];
	for (let i = 0; i < allVocabList.length; i += MAX_VOCAB_PER_STORY) {
		vocabChunks.push(allVocabList.slice(i, i + MAX_VOCAB_PER_STORY));
	}

	const totalStories = vocabChunks.length;
	console.log(
		`   Splitting into ${totalStories} story/stories (max ${MAX_VOCAB_PER_STORY} words each)`,
	);

	// 4. Generate story for each chunk
	for (let chunkIndex = 0; chunkIndex < vocabChunks.length; chunkIndex++) {
		const vocabList = vocabChunks[chunkIndex];
		const storyNumber = chunkIndex + 1;
		const isMultiStory = totalStories > 1;

		await generateStoryForChunk(unitId, vocabList, {
			storyNumber,
			totalStories,
			isMultiStory,
		});
	}
}

/**
 * Generate story for a vocabulary chunk
 */
async function generateStoryForChunk(
	unitId: string,
	vocabList: Array<{ id: string; word: string; reading: string; meaning: string }>,
	options: { storyNumber: number; totalStories: number; isMultiStory: boolean },
): Promise<void> {
	const { storyNumber, totalStories, isMultiStory } = options;
	const chunkStart = (storyNumber - 1) * MAX_VOCAB_PER_STORY + 1;
	const chunkEnd = Math.min(
		storyNumber * MAX_VOCAB_PER_STORY,
		vocabList.length + (storyNumber - 1) * MAX_VOCAB_PER_STORY,
	);

	console.log(
		`\n   📖 Generating Story ${storyNumber}/${totalStories} (words ${chunkStart}-${chunkEnd})`,
	);

	// Prepare vocabulary list for prompt
	const vocabListFormatted = vocabList
		.map((v, i) => `${i + 1}. ${v.word} (${v.reading}) - ${v.meaning} [vocab_id: ${v.id}]`)
		.join('\n');

	// Build story context message
	const storyContextMessage = isMultiStory
		? `
## STORY CONTEXT

**This is Story ${storyNumber} of ${totalStories} for this unit.**

**IMPORTANT:** This unit has ${totalStories} stories total. Your story should:
- Be self-contained (readable independently, but can be part of a series)
- Include "Part ${storyNumber}" or "Chapter ${storyNumber}" in the title to indicate sequence
- Cover vocabulary words ${chunkStart}-${chunkEnd} (${vocabList.length} words in this story)
- Maintain the same quality standards as a standalone story
- If creating a series, you can reference previous parts subtly, but the story should work independently
`
		: `
## STORY CONTEXT

**This is the only story for this unit.** Include all vocabulary words naturally.
`;

	const prompt = `
You are an expert Japanese language learning content creator with 10+ years of experience. Your task is to write a high-quality, engaging story that helps learners acquire vocabulary through meaningful context.

## YOUR ROLE & EXPERTISE

You specialize in:
- Creating engaging narratives for language learners
- Integrating vocabulary naturally into stories
- Balancing cognitive load with learning effectiveness
- Understanding Japanese cultural contexts
- Writing stories that create emotional connections

${storyContextMessage}

## VOCABULARY WORDS TO INCLUDE

${vocabListFormatted}

**CRITICAL:** ALL ${vocabList.length} words MUST appear naturally in the story. No words can be omitted.

## STORY REQUIREMENTS

### 1. LENGTH & STRUCTURE (MANDATORY)

- **Word Count:** EXACTLY 100-150 words (count carefully - this is non-negotiable)
- **Narrative Structure:** Must have a clear beginning, middle, and end
  - **Beginning:** Set the scene, introduce context (20-30 words)
  - **Middle:** Develop the situation, create engagement (60-90 words)
  - **End:** Provide closure, satisfying conclusion (20-30 words)

### 2. MIXED LANGUAGE FORMAT (CRITICAL)

**Rule:** Use English grammar and sentence structure, but naturally include Japanese vocabulary words where they fit contextually.

**✅ CORRECT Examples:**
- "I went to the スーパー to buy fresh りんご for dinner."
- "When I arrived at the station, I saw my friend waiting. 初めまして, I said with a smile."
- "The ねこ followed me home, and I gave it some food."

**❌ INCORRECT Examples (DO NOT DO THIS):**
- "わたし am Sarah." (mixing Japanese pronoun with English verb)
- "I から 来ました アメリカ." (incorrect word order)
- "Hello! 初めまして. わたし am Miller." (choppy, unnatural)

**Key Principles:**
- Use English sentence structure: Subject + Verb + Object
- Insert Japanese words as nouns, verbs, or phrases naturally
- Maintain English grammar throughout
- Japanese words should feel like natural replacements for English equivalents

### 3. NATURAL VOCABULARY INTEGRATION (MANDATORY)

**Rule:** Vocabulary words must appear naturally in context, not as isolated items.

**✅ CORRECT:**
> "I went to the スーパー to buy fresh りんご, but a friendly ねこ followed me home. My ともだち who works there helped me find the perfect apples."

**❌ INCORRECT:**
> "I went to the スーパー. Then I bought りんご. Then I saw ねこ. My ともだち was there."

**Integration Techniques:**
- Connect words in meaningful relationships
- Use words multiple times if natural (shows different contexts)
- Create semantic connections between related words
- Avoid listing words in sequence

### 4. ENGAGING NARRATIVE (MANDATORY)

**Rule:** The story must be engaging, relatable, and contextually meaningful.

**Required Elements:**
- **Setting:** Clear time, place, or situation
- **Characters:** At least one person or entity
- **Action/Event:** Something happens (meeting, discovery, problem-solving)
- **Emotional Connection:** Relatable scenario that learners can imagine
- **Closure:** Satisfying ending that completes the narrative arc

**Good Story Themes:**
- Daily life scenarios (shopping, cooking, commuting, meeting people)
- Cultural experiences (festivals, traditions, customs)
- Personal anecdotes (first day at school, making friends, solving problems)
- Relatable situations (getting lost, ordering food, asking for help)

**Avoid:**
- Abstract concepts without context
- Lists or drills disguised as stories
- Unrelated random events
- Stories that feel like vocabulary exercises

### 5. CULTURAL AUTHENTICITY (IMPORTANT)

- Use appropriate Japanese cultural contexts
- Include proper honorifics when relevant (初めまして, どうぞよろしくお願いします)
- Reflect real Japanese social situations
- Avoid stereotypes or cultural insensitivity
- Use appropriate formality levels

### 6. COGNITIVE LOAD MANAGEMENT

- Keep sentence structure simple and clear
- Use familiar English grammar patterns
- Limit complex Japanese grammar structures
- Focus on vocabulary acquisition, not grammar learning
- Ensure 80% of words are familiar (English), 20% are target vocabulary (Japanese)

## OUTPUT FORMAT (STRICT JSON)

**IMPORTANT:** Users can switch languages in the application. You MUST provide both English and Vietnamese versions.

You MUST output valid JSON matching this exact structure:

\`\`\`json
{
  "title": {
    "en": "Story Title in English (Engaging, 3-5 words)",
    "vi": "Tiêu đề câu chuyện bằng tiếng Việt",
    "ja": "日本語のタイトル"
  },
  "body_text": {
    "en": "The complete story text here in ENGLISH with Japanese words mixed in. This must be 100-150 words. Japanese vocabulary words should appear naturally within the English text. DO NOT use placeholders. Write the complete, final text in English.",
    "vi": "Câu chuyện hoàn chỉnh bằng TIẾNG VIỆT với từ tiếng Nhật được trộn vào. Phải có 100-150 từ. Từ vựng tiếng Nhật nên xuất hiện tự nhiên trong văn bản tiếng Việt. KHÔNG sử dụng placeholder. Viết văn bản hoàn chỉnh, cuối cùng bằng tiếng Việt.",
    "ja": "完全な日本語のストーリー。100-150語。自然な日本語で書いてください。"
  },
  "translation": {
    "en": "The complete story text here in ENGLISH with ALL Japanese words replaced with English translations. This must be 100-150 words. DO NOT include any Japanese words in the translation - replace them all with English equivalents.",
    "vi": "Văn bản câu chuyện hoàn chỉnh bằng TIẾNG VIỆT với TẤT CẢ từ tiếng Nhật được thay bằng tiếng Việt. Phải có 100-150 từ. KHÔNG bao gồm bất kỳ từ tiếng Nhật nào trong bản dịch - thay thế tất cả bằng từ tiếng Việt tương đương."
  },
  "highlights": [
    {
      "vocab_id": "${vocabList[0].id}",
      "word_surface": "${vocabList[0].word}",
      "start_index": 0,
      "length": 0
    }
  ]
}
\`\`\`

**Language Requirements:**
- **Title:** Must have \`en\` (English), \`vi\` (Vietnamese), and \`ja\` (Japanese) ✅
- **Body Text:** Must be an object with \`en\`, \`vi\`, and \`ja\` keys. Each version should have Japanese vocabulary words mixed in naturally. ✅
- **Translation:** Must have BOTH \`en\` (English - ALL Japanese words replaced) and \`vi\` (Vietnamese - ALL Japanese words replaced) ✅

**Translation Guidelines:**
- Translation must be 100-150 words (same length as body_text)
- **CRITICAL:** Translation should have ALL Japanese words REPLACED with their English/Vietnamese equivalents
- Do NOT include any Japanese words in the translation
- Maintain the same narrative structure and flow
- Keep the same emotional tone and cultural context
- The translation helps users understand the full meaning without Japanese words

## HIGHLIGHT GENERATION (CRITICAL TECHNICAL REQUIREMENT)

**For EACH vocabulary word, you must:**

1. **Find the exact position** where the word appears in \`body_text.en\`, \`body_text.vi\`, and \`body_text.ja\`
2. **Calculate \`position\`:** Character position (0-based) where the word starts in EACH language version
3. **Calculate \`length\`:** Exact number of characters in the Japanese word
4. **Match \`word_surface\`:** Must exactly match the text in \`body_text\` at that position

**Example Calculation:**

If \`body_text.en\` is: "I went to the スーパー to buy りんご."
If \`body_text.vi\` is: "Tôi đã đến スーパー để mua りんご."
If \`body_text.ja\` is: "私はスーパーへりんごを買いに行きました。"

For "スーパー":
- In \`body_text.en\`: position 14, length 4
- In \`body_text.vi\`: position 12, length 4  
- In \`body_text.ja\`: position 2, length 4

For "りんご":
- In \`body_text.en\`: position 28, length 3
- In \`body_text.vi\`: position 25, length 3
- In \`body_text.ja\`: position 7, length 3

**CRITICAL RULES:**
- \`start_index\` is 0-based (first character = 0, not 1)
- \`length\` must match the exact character count of the Japanese word
- \`word_surface\` must exactly match the text in \`body_text.en\`, \`body_text.vi\`, and \`body_text.ja\`
- Each highlight must be a SINGLE vocabulary word (not phrases)
- If a word appears multiple times, create multiple highlights with different \`start_index\` values
- You must calculate positions for ALL THREE languages (en, vi, ja)

**VERIFICATION CHECKLIST:**
- [ ] Every vocabulary word has exactly one highlight (or multiple if word appears multiple times)
- [ ] \`start_index\` + \`length\` extracts the correct word from \`body_text.en\`, \`body_text.vi\`, and \`body_text.ja\`
- [ ] \`word_surface\` exactly matches the extracted text in all three language versions
- [ ] No highlights for phrases (only single words)
- [ ] All three language versions of body_text are provided

## QUALITY CHECKLIST

Before finalizing your output, verify:

**Content Quality:**
- [ ] Story is exactly 100-150 words
- [ ] Clear narrative structure (beginning, middle, end)
- [ ] All vocabulary words appear naturally
- [ ] Engaging and relatable scenario
- [ ] Proper mixed-language format (English grammar, Japanese words)

**Technical Quality:**
- [ ] All highlights have correct \`start_index\` and \`length\`
- [ ] \`word_surface\` exactly matches text in \`body_text\`
- [ ] All \`vocab_id\` values are correct UUIDs from the list above
- [ ] JSON is valid and properly formatted

**Learning Effectiveness:**
- [ ] Words appear in meaningful context
- [ ] Story creates semantic connections between words
- [ ] Narrative is memorable and engaging
- [ ] Cultural context is appropriate

## FINAL INSTRUCTIONS

1. **Read all requirements carefully** - Every requirement is mandatory
2. **Write the complete story first** - Don't worry about highlights initially
3. **Verify word count** - Must be exactly 100-150 words
4. **Calculate highlights carefully** - Double-check every \`start_index\` and \`length\`
5. **Validate JSON format** - Ensure valid JSON before outputting
6. **Quality check** - Review against all checklists above

**Remember:** Your story will be used by thousands of language learners. Quality matters. Take your time to create something engaging, accurate, and pedagogically sound.

Now, generate the story following ALL requirements above.
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
		// Highlights are now strings (word surfaces), not objects
		const includedWords = storyContent.highlights || [];
		const requiredWords = vocabList.map((v) => v.word);
		const missingWords = requiredWords.filter((word) => !includedWords.includes(word));

		if (missingWords.length > 0) {
			console.error(`❌ Missing words in story for unit ${unitId}:`, missingWords);
			return;
		}

		// 6. Check if story already exists (for this chunk)
		// For multi-story units, we need to identify which story this is
		// We'll use a simple approach: find existing stories and match by vocabulary coverage
		const existingStories = await prisma.story.findMany({
			where: { unitId },
			select: { id: true, content: true },
		});

		// Try to find matching story by checking if it has the same vocabulary words
		// Highlights are now strings (word surfaces), not objects
		let matchingStory = null;
		for (const existing of existingStories) {
			const existingContent = StoryContentSchema.safeParse(existing.content);
			if (existingContent.success) {
				const existingWords = existingContent.data.highlights || [];
				const currentWords = vocabList.map((v) => v.word);
				// Check if vocab sets match (all current words are in existing story)
				const allMatch = currentWords.every((word) => existingWords.includes(word));
				if (allMatch && existingWords.length === currentWords.length) {
					matchingStory = existing;
					break;
				}
			}
		}

		if (matchingStory) {
			console.log(`   ⚠️  Story ${storyNumber} already exists, updating...`);
			await prisma.story.update({
				where: { id: matchingStory.id },
				data: {
					content: storyContent,
					contentStatus: 'AI_GENERATED',
				},
			});
			console.log(`   ✅ Story ${storyNumber} updated`);
		} else {
			// Generate slug from title
			const titleText = storyContent.title.en || storyContent.title.vi || 'untitled-story';
			const existingStories = await prisma.story.findMany({
				select: { slug: true },
			});
			const existingSlugs = existingStories
				.map((s) => s.slug)
				.filter((slug): slug is string => Boolean(slug));
			const slug = generateSlug(titleText, existingSlugs);

			await prisma.story.create({
				data: {
					unitId,
					slug,
					order: options.storyNumber - 1, // 0-indexed
					content: storyContent,
					contentStatus: 'AI_GENERATED',
					difficulty: 'N5', // Default, can be adjusted later
					category: 'daily_life', // Default, can be adjusted later
					readTimeMin: Math.ceil((storyContent.body_text.en.split(/\s+/).length || 100) / 200), // Estimate: 200 words per minute
				},
			});
			console.log(`   ✅ Story ${storyNumber} created with slug: ${slug}`);
		}
	} catch (error) {
		console.error(`❌ Error generating story ${storyNumber} for unit ${unitId}:`, error);
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
