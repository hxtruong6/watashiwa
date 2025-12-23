/**
 * Script to generate 50 CSV files (one per unit) from ref_minna_vocab.yaml
 * Merges Vietnamese data from All Decks_2.txt
 * Usage: npx tsx scripts/generate_unit_csvs.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

interface VocabWord {
	id: [number, number];
	edition: number[];
	kanji: string | null;
	kana: string;
	romaji: string;
	meaning: {
		en: string;
		fr: string;
	};
}

interface YamlData {
	[key: string]: VocabWord[] | unknown;
}

interface VietnameseData {
	kana: string;
	meaning_vi: string;
	han_viet: string;
}

// CSV columns (removed meaning_fr and edition)
const CSV_HEADER = 'id,unit,word_number,kanji,kana,romaji,meaning_en,meaning_vi,han_viet';

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSV(value: string | null | undefined): string {
	if (value === null || value === undefined || value === '~') {
		return '';
	}
	const str = String(value);
	// If contains comma, quote, or newline, wrap in quotes and escape internal quotes
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

/**
 * Parse All Decks_2.txt to extract Vietnamese meanings and Hán Việt
 * Format: Column 3 = kana, Column 4 = meaning_vi, Column 5 = han_viet
 */
function parseVietnameseData(txtPath: string): Map<string, VietnameseData> {
	const content = fs.readFileSync(txtPath, 'utf-8');
	const lines = content.split('\n');
	const vnMap = new Map<string, VietnameseData>();

	for (const line of lines) {
		// Skip header lines
		if (line.startsWith('#')) continue;
		if (line.trim() === '') continue;

		const columns = line.split('\t');
		if (columns.length < 5) continue;

		const kana = columns[2]?.trim();
		const meaning_vi = columns[3]?.trim();
		const han_viet = columns[4]?.trim();

		if (kana) {
			vnMap.set(kana, {
				kana,
				meaning_vi: meaning_vi || '',
				han_viet: han_viet || '',
			});
		}
	}

	return vnMap;
}

async function main() {
	const yamlPath = path.join(process.cwd(), 'data/ref_minna_vocab.yaml');
	const txtPath = path.join(process.cwd(), 'data/All Decks_2.txt');
	const outputDir = path.join(process.cwd(), 'data/csv');

	// Create output directory if not exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
		console.log(`✅ Created directory: ${outputDir}`);
	}

	// Parse Vietnamese data
	console.log('📖 Reading All Decks_2.txt...');
	const vnMap = parseVietnameseData(txtPath);
	console.log(`📊 Loaded ${vnMap.size} Vietnamese entries`);

	// Read and parse YAML
	console.log('📖 Reading ref_minna_vocab.yaml...');
	const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
	const data: YamlData = yaml.parse(yamlContent);

	let totalWords = 0;
	let matchedVN = 0;
	const unitStats: { unit: number; count: number; matched: number }[] = [];

	// Process each lesson (1-50)
	for (let unitNum = 1; unitNum <= 50; unitNum++) {
		const lessonKey = `lesson-${unitNum.toString().padStart(2, '0')}`;
		const words = data[lessonKey] as VocabWord[] | undefined;

		if (!words || !Array.isArray(words)) {
			console.warn(`⚠️ No data found for ${lessonKey}`);
			continue;
		}

		// Build CSV content
		const rows: string[] = [CSV_HEADER];
		let unitMatched = 0;

		words.forEach((word, index) => {
			// Try to match Vietnamese data by kana
			const vnData = vnMap.get(word.kana);
			const meaning_vi = vnData?.meaning_vi || '';
			const han_viet = vnData?.han_viet || '';

			if (vnData) {
				unitMatched++;
				matchedVN++;
			}

			const row = [
				`${unitNum}-${index + 1}`, // id
				escapeCSV(String(unitNum)), // unit
				escapeCSV(String(word.id?.[1] ?? index + 1)), // word_number
				escapeCSV(word.kanji), // kanji
				escapeCSV(word.kana), // kana
				escapeCSV(word.romaji), // romaji
				escapeCSV(word.meaning?.en), // meaning_en
				escapeCSV(meaning_vi), // meaning_vi (from All Decks_2.txt)
				escapeCSV(han_viet), // han_viet (from All Decks_2.txt)
			].join(',');
			rows.push(row);
		});

		// Write CSV file
		const fileName = `unit${unitNum.toString().padStart(2, '0')}.csv`;
		const filePath = path.join(outputDir, fileName);
		fs.writeFileSync(filePath, rows.join('\n'), 'utf-8');

		totalWords += words.length;
		unitStats.push({ unit: unitNum, count: words.length, matched: unitMatched });
		console.log(`📝 ${fileName}: ${words.length} words (${unitMatched} matched VN)`);
	}

	// Print summary
	console.log('\n' + '='.repeat(60));
	console.log(`✅ Generated ${unitStats.length} CSV files in ${outputDir}`);
	console.log(`📊 Total vocabulary: ${totalWords} words`);
	console.log(
		`🇻🇳 Vietnamese matches: ${matchedVN}/${totalWords} (${((matchedVN / totalWords) * 100).toFixed(1)}%)`,
	);
	console.log('='.repeat(60));
}

main().catch(console.error);
