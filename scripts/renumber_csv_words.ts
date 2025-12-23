/**
 * Renumber word_number column to be sequential in each CSV file
 * Usage: npx tsx scripts/renumber_csv_words.ts
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
}

function escapeCSV(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

async function main() {
	const csvDir = path.join(process.cwd(), 'data/csv');
	const CSV_HEADER = 'id,unit,word_number,kanji,kana,romaji,meaning_en,meaning_vi,han_viet';

	let totalRenumbered = 0;

	// Process each unit file
	for (let unitNum = 1; unitNum <= 50; unitNum++) {
		const fileName = `unit${unitNum.toString().padStart(2, '0')}.csv`;
		const filePath = path.join(csvDir, fileName);

		// Read file
		const content = fs.readFileSync(filePath, 'utf-8');
		const lines = content.trim().split('\n');

		// Parse entries
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
				});
			}
		}

		// Renumber sequentially
		const renumberedLines = entries.map((entry, index) => {
			const newWordNum = index + 1;
			const newId = `${unitNum}-${newWordNum}`;

			return [
				escapeCSV(newId),
				escapeCSV(entry.unit),
				escapeCSV(String(newWordNum)),
				escapeCSV(entry.kanji),
				escapeCSV(entry.kana),
				escapeCSV(entry.romaji),
				escapeCSV(entry.meaning_en),
				escapeCSV(entry.meaning_vi),
				escapeCSV(entry.han_viet),
			].join(',');
		});

		// Write back
		const output = [CSV_HEADER, ...renumberedLines].join('\n');
		fs.writeFileSync(filePath, output, 'utf-8');

		totalRenumbered += entries.length;
		console.log(`📝 ${fileName}: Renumbered ${entries.length} entries (1-${entries.length})`);
	}

	console.log('\n' + '='.repeat(60));
	console.log(`✅ Renumbering complete!`);
	console.log(`📊 Total entries renumbered: ${totalRenumbered}`);
	console.log('='.repeat(60));
}

main().catch(console.error);
