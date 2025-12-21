import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import {
	ConfusionExplanationSchema,
	EtymologySchema,
	ExamplesSchema,
	LocalizedStringSchema,
	MeaningsSchema,
} from '../src/lib/schemas/jsonb';

const GEN_MODEL = 'gemini-2.5-flash';
// Initialize Gemini (New SDK)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Helper to generate content
async function callGemini(prompt: string) {
	const response = await genAI.models.generateContent({
		model: GEN_MODEL,
		contents: prompt,
		config: { responseMimeType: 'application/json' },
	});
	return response.text?.toString() || '';
}

// Define the output structure we want from AI
const AIResponseSchema = z.object({
	word_surface: z.string(),
	han_viet: z.string(),
	kana: z.string(),
	romaji: z.string(),
	tags: z.array(z.string()), // Added for categorization
	pitch_pattern: z.number().int(), // 0=Heiban, 1=Atamadaka...
	pitch_svg_path: z.string(), // SVG visualization
	etymology: EtymologySchema,
	meanings: MeaningsSchema,
	examples: ExamplesSchema,
	mnemonic: LocalizedStringSchema,
	confusions: z
		.array(
			z.object({
				word: z.string(),
				explanation: ConfusionExplanationSchema,
			}),
		)
		.optional(),
});

type AIResponse = z.infer<typeof AIResponseSchema>;

async function generateWordContent(word: string): Promise<AIResponse | null> {
	console.log(`Generating content for: ${word}...`);

	const prompt = `
    You are a linguist expert in Japanese, Vietnamese, and English.
    Analyze the Japanese word "${word}".
    Provide a strict JSON response.
    
    CRITICAL INSTRUCTION FOR BILINGUAL CONTENT:
    1. Vietnamese ("vi"): Focus on Hán Việt (Sino-Vietnamese) roots and mnemonics. This is the "Aha!" moment for Vietnamese learners.
    2. English ("en"): Focus on Kanji breakdown (pictographs) or English sound-alike mnemonics. DO NOT reference Hán Việt in the English field.

    Required Fields:
    1. Basic info: word_surface (Kanji/Kana), han_viet (UPPERCASE), kana, romaji.
    2. Tags: Array of tags (e.g., "n5", "noun", "suru-verb", "transitive").
    3. Pitch Accent: 
       - pattern: Integer (0=Heiban, 1=Atamadaka, 2=Nakadaka, 3=Odaka).
       - svg_path: A simple SVG path string (e.g. "M0,20 L25,5...") visualizing the pitch lines.
    4. Etymology: Breakdown of parts. APPLY THE BILINGUAL INSTRUCTION ABOVE for the 'note'.
    5. Meanings: "vi" and "en" arrays.
    6. Examples: 2-3 sentences with translations (vi, en).
    7. Mnemonic: A short, memorable hook. 
       - "vi": Use Hán Việt or puns natural to Vietnamese.
       - "en": Use English puns or visual stories.
    8. Confusions: Identify 1-2 commonly confused words. APPLY THE BILINGUAL INSTRUCTION ABOVE for the 'explanation'.

    Format strictly according to this JSON schema:
    {
      "word_surface": "string",
      "han_viet": "string",
      "kana": "string",
      "romaji": "string",
      "tags": ["string"],
      "pitch_pattern": 0,
      "pitch_svg_path": "string",
      "etymology": { "parts": [{"kanji": "...", "han_viet": "...", "meaning": {"vi": "...", "en": "..."}}], "note": {"vi": "...", "en": "..."} },
      "meanings": { "vi": ["..."], "en": ["..."] },
      "examples": [{ "sentence": "...", "translation": {"vi": "...", "en": "..."} }],
      "mnemonic": { "vi": "...", "en": "..." },
      "confusions": [{ "word": "...", "explanation": { "mnemonic": {"vi": "...", "en": "..."}, "item1_nuance": {"vi": "...", "en": "..."}, "item2_nuance": {"vi": "...", "en": "..."} } }]
    }
  `;

	try {
		const jsonString = await callGemini(prompt);
		const data = JSON.parse(jsonString || '{}');
		console.log(data);

		// Validate with Zod
		const validated = AIResponseSchema.parse(data);

		return validated;
	} catch (error) {
		console.error(`Error generating ${word}:`, error);
		return null;
	}
}

async function main() {
	const rawFile = path.join(process.cwd(), 'seed/n5_raw.json');
	const outFile = path.join(process.cwd(), 'seed/data/n5_verified.json');

	// Ensure output dir exists
	await fs.mkdir(path.dirname(outFile), { recursive: true });

	const rawWords = JSON.parse(await fs.readFile(rawFile, 'utf-8')) as string[];
	const verifiedData: AIResponse[] = [];

	// Load existing data if available
	try {
		const existingContent = await fs.readFile(outFile, 'utf-8');
		const parsed = JSON.parse(existingContent);
		if (Array.isArray(parsed)) {
			verifiedData.push(...parsed);
			console.log(`Loaded ${verifiedData.length} existing words from ${outFile}`);
		}
	} catch {
		console.log('No existing data found, starting fresh.');
	}

	// Create a Set of existing words for fast lookup
	// We assume the 'kanji' field in the output matches the input word
	const existingWords = new Set(verifiedData.map((item) => item.word_surface));

	for (const word of rawWords) {
		if (existingWords.has(word)) {
			console.log(`Skipping: ${word} (already exists)`);
			continue;
		}

		const content = await generateWordContent(word);
		if (content) {
			verifiedData.push(content);
			// Save immediately after each success
			await fs.writeFile(outFile, JSON.stringify(verifiedData, null, 2));
			console.log(`Saved: ${word} (${verifiedData.length}/${rawWords.length})`);
		}
		// Small delay to avoid rate limits if any
		await new Promise((r) => setTimeout(r, 1000));
	}

	console.log(`Completed! Total words: ${verifiedData.length}`);
}

main().catch(console.error);
