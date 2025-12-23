/**
 * Remove duplicates from CSV files (same kana + same meaning)
 * Usage: npx tsx scripts/deduplicate_csvs.ts
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
	line: string;
}

function parseCSV(filePath: string): VocabEntry[] {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.trim().split('\n');
	const entries: VocabEntry[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
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
		fields.push(current);

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
				line: line,
			});
		}
	}

	return entries;
}

function normalizeText(text: string): string {
	// Normalize for comparison: lowercase, trim, remove extra spaces
	return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function main() {
	const csvDir = path.join(process.cwd(), 'data/csv');
	const CSV_HEADER = 'id,unit,word_number,kanji,kana,romaji,meaning_en,meaning_vi,han_viet';

	// Track first occurrence of each (kana + meaning) combination
	const seenEntries = new Map<string, VocabEntry>();
	let totalRemoved = 0;
	const stats: { unit: number; original: number; after: number; removed: number }[] = [];

	// Process each unit file in order (1-50)
	for (let unitNum = 1; unitNum <= 50; unitNum++) {
		const fileName = `unit${unitNum.toString().padStart(2, '0')}.csv`;
		const filePath = path.join(csvDir, fileName);

		const entries = parseCSV(filePath);
		const originalCount = entries.length;

		// Filter out duplicates (same kana + same meaning_en)
		const uniqueEntries = entries.filter((entry) => {
			// Create composite key: kana + normalized meaning
			const key = `${entry.kana}::${normalizeText(entry.meaning_en)}`;

			if (seenEntries.has(key)) {
				// This is a duplicate
				return false;
			}
			seenEntries.set(key, entry);
			return true;
		});

		const removed = originalCount - uniqueEntries.length;
		totalRemoved += removed;

		// Rewrite CSV file
		const lines = [CSV_HEADER, ...uniqueEntries.map((e) => e.line)];
		fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

		stats.push({
			unit: unitNum,
			original: originalCount,
			after: uniqueEntries.length,
			removed: removed,
		});

		if (removed > 0) {
			console.log(`📝 ${fileName}: ${originalCount} → ${uniqueEntries.length} (-${removed})`);
		}
	}

	console.log('\n' + '='.repeat(60));
	console.log(`✅ Deduplication complete (kana + meaning logic)!`);
	console.log(
		`📊 Total entries: ${stats.reduce((s, u) => s + u.original, 0)} → ${stats.reduce((s, u) => s + u.after, 0)}`,
	);
	console.log(`🗑️  Removed duplicates: ${totalRemoved}`);
	console.log(`   Units affected: ${stats.filter((u) => u.removed > 0).length}/50`);
	console.log('='.repeat(60));

	if (totalRemoved > 0) {
		const topUnits = stats
			.filter((u) => u.removed > 0)
			.sort((a, b) => b.removed - a.removed)
			.slice(0, 10);
		console.log(`\n📉 Units with most duplicates removed:`);
		topUnits.forEach((u, i) => {
			console.log(`   ${i + 1}. Unit ${u.unit}: -${u.removed} (${u.original} → ${u.after})`);
		});
	}
}

main().catch(console.error);
