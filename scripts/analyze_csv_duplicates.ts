/**
 * Analyze duplicates in generated CSV files
 * Usage: npx tsx scripts/analyze_csv_duplicates.ts
 */
import * as fs from 'fs';
import * as path from 'path';

interface VocabEntry {
	id: string;
	unit: string;
	word_number: string;
	kanji: string;
	kana: string;
	romaji: string;
	meaning_en: string;
	meaning_vi: string;
	han_viet: string;
	source_file: string;
}

function parseCSV(filePath: string): VocabEntry[] {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.trim().split('\n');
	const entries: VocabEntry[] = [];

	// Skip header
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		// Simple CSV parsing (handles quoted fields)
		const fields: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let j = 0; j < line.length; j++) {
			const char = line[j];
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === ',' && !inQuotes) {
				fields.push(current);
				current = '';
			} else {
				current += char;
			}
		}
		fields.push(current); // Last field

		if (fields.length >= 9) {
			entries.push({
				id: fields[0],
				unit: fields[1],
				word_number: fields[2],
				kanji: fields[3],
				kana: fields[4],
				romaji: fields[5],
				meaning_en: fields[6],
				meaning_vi: fields[7],
				han_viet: fields[8],
				source_file: path.basename(filePath),
			});
		}
	}

	return entries;
}

async function main() {
	const csvDir = path.join(process.cwd(), 'data/csv');
	const allEntries: VocabEntry[] = [];

	// Read all CSV files
	for (let i = 1; i <= 50; i++) {
		const fileName = `unit${i.toString().padStart(2, '0')}.csv`;
		const filePath = path.join(csvDir, fileName);
		const entries = parseCSV(filePath);
		allEntries.push(...entries);
	}

	console.log(`📊 Total entries: ${allEntries.length}`);

	// Find duplicates by kana
	const kanaMap = new Map<string, VocabEntry[]>();
	allEntries.forEach((entry) => {
		if (!kanaMap.has(entry.kana)) {
			kanaMap.set(entry.kana, []);
		}
		kanaMap.get(entry.kana)!.push(entry);
	});

	// Count duplicates
	const duplicates = Array.from(kanaMap.entries()).filter(([_, entries]) => entries.length > 1);

	console.log(`\n🔍 Duplicate Analysis:`);
	console.log(`   Unique kana entries: ${kanaMap.size}`);
	console.log(`   Duplicate kana entries: ${duplicates.length}`);
	console.log(
		`   Total duplicate instances: ${duplicates.reduce((sum, [_, entries]) => sum + entries.length, 0)}`,
	);
	console.log(
		`   Entries to remove: ${duplicates.reduce((sum, [_, entries]) => sum + entries.length - 1, 0)}`,
	);

	// Show top 20 duplicates
	console.log(`\n📝 Top 20 Most Duplicated Entries:`);
	const sorted = duplicates.sort((a, b) => b[1].length - a[1].length);
	sorted.slice(0, 20).forEach(([kana, entries], index) => {
		console.log(`   ${index + 1}. ${kana} (${entries.length} times)`);
		entries.forEach((e) => {
			console.log(
				`      - ${e.source_file}: ${e.kanji || e.kana} (${e.meaning_en.substring(0, 40)}...)`,
			);
		});
	});
}

main().catch(console.error);
