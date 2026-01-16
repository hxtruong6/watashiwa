/**
 * Kanji Seeding Script (CSV Import)
 *
 * Seeds the Kanji table from production-ready CSV file(s)
 * Supports both single file and directory of CSV files
 *
 * Usage:
 *   pnpm tsx scripts/seed-kanji.ts [path-to-csv-or-directory]
 *
 * Examples:
 *   pnpm tsx scripts/seed-kanji.ts ./data/kanji-seed.csv
 *   pnpm tsx scripts/seed-kanji.ts /path/to/csv/directory
 *
 * Default: ./data/kanji-seed.csv
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { prisma } from '../../src/lib/db';

interface KanjiCsvRow {
	kanji: string;
	onyomi: string;
	kunyomi: string;
	nanori: string;
	meaning: string;
	freq: string;
	jlpt: string;
	stroke_count: string;
	meaning_vi: string;
	han_viet: string;
}

/**
 * Parse semicolon-separated readings into array
 */
function parseReadings(value: string): string[] {
	if (!value || value.trim() === '') {
		return [];
	}
	return value
		.split(';')
		.map((r) => r.trim())
		.filter((r) => r !== '');
}

/**
 * Parse CSV file with proper quote handling
 */
async function parseCsvFile(filePath: string): Promise<KanjiCsvRow[]> {
	const content = await fs.readFile(filePath, 'utf-8');
	const lines = content.split('\n').filter((line) => line.trim() !== '');

	if (lines.length < 2) {
		throw new Error('CSV file must have at least a header and one data row');
	}

	// Parse header
	const headers = lines[0].split(',').map((h) => h.trim());

	// Find column indices
	const getIndex = (name: string): number => {
		const idx = headers.indexOf(name);
		if (idx === -1) {
			throw new Error(`Column "${name}" not found in CSV header`);
		}
		return idx;
	};

	const kanjiIdx = getIndex('kanji');
	const onyomiIdx = getIndex('onyomi');
	const kunyomiIdx = getIndex('kunyomi');
	const nanoriIdx = getIndex('nanori');
	const meaningIdx = getIndex('meaning');
	const freqIdx = getIndex('freq');
	const jlptIdx = getIndex('jlpt');
	const strokeCountIdx = getIndex('stroke_count');
	const meaningViIdx = getIndex('meaning_vi');
	const hanVietIdx = getIndex('han_viet');

	// Parse data rows
	const rows: KanjiCsvRow[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		const values: string[] = [];
		let current = '';
		let inQuotes = false;

		// Simple CSV parsing (handles quoted fields)
		for (let j = 0; j < line.length; j++) {
			const char = line[j];
			if (char === '"') {
				if (inQuotes && line[j + 1] === '"') {
					// Escaped quote
					current += '"';
					j++;
				} else {
					// Toggle quote state
					inQuotes = !inQuotes;
				}
			} else if (char === ',' && !inQuotes) {
				values.push(current);
				current = '';
			} else {
				current += char;
			}
		}
		values.push(current); // Add last field

		// Extract values
		const kanji = values[kanjiIdx]?.trim();
		if (!kanji) {
			continue; // Skip empty rows
		}

		rows.push({
			kanji,
			onyomi: values[onyomiIdx]?.trim() || '',
			kunyomi: values[kunyomiIdx]?.trim() || '',
			nanori: values[nanoriIdx]?.trim() || '',
			meaning: values[meaningIdx]?.trim() || '',
			freq: values[freqIdx]?.trim() || '',
			jlpt: values[jlptIdx]?.trim() || '',
			stroke_count: values[strokeCountIdx]?.trim() || '',
			meaning_vi: values[meaningViIdx]?.trim() || '',
			han_viet: values[hanVietIdx]?.trim() || '',
		});
	}

	return rows;
}

/**
 * Process a single kanji row and upsert to database
 */
async function processKanjiRow(row: KanjiCsvRow): Promise<{
	inserted: boolean;
	updated: boolean;
}> {
	// Parse readings (combine kunyomi and nanori)
	const onyomiReadings = parseReadings(row.onyomi);
	const kunyomiReadings = [...parseReadings(row.kunyomi), ...parseReadings(row.nanori)].filter(
		(r) => r !== '',
	);

	// Parse numeric fields
	const jlptLevel = row.jlpt ? parseInt(row.jlpt, 10) : null;
	const strokeCount = parseInt(row.stroke_count || '0', 10);
	const frequency = row.freq ? parseInt(row.freq, 10) : null;

	const data = {
		character: row.kanji,
		meaningVi: row.meaning_vi || null,
		meaningEn: row.meaning || null,
		hanViet: row.han_viet || null,
		onyomiReadings,
		kunyomiReadings,
		jlptLevel: jlptLevel && !isNaN(jlptLevel) ? jlptLevel : null,
		strokeCount: isNaN(strokeCount) ? 0 : strokeCount,
		frequency: frequency && !isNaN(frequency) ? frequency : null,
	};

	const existing = await prisma.kanji.findUnique({
		where: { character: data.character },
	});

	if (existing) {
		await prisma.kanji.update({
			where: { character: data.character },
			data,
		});
		return { inserted: false, updated: true };
	} else {
		await prisma.kanji.create({ data });
		return { inserted: true, updated: false };
	}
}

/**
 * Process a single CSV file
 */
async function processCsvFile(
	filePath: string,
): Promise<{ inserted: number; updated: number; total: number }> {
	console.log(`\n📄 Processing: ${path.basename(filePath)}`);

	// Parse CSV
	const csvData = await parseCsvFile(filePath);
	console.log(`   📖 Parsed ${csvData.length} kanji entries`);

	// Filter to valid entries
	const validKanji = csvData.filter((k) => k.kanji && k.kanji.length === 1);
	console.log(`   ✅ ${validKanji.length} valid kanji entries`);

	let inserted = 0;
	let updated = 0;

	// Process in batches for better performance
	const batchSize = 100;
	for (let i = 0; i < validKanji.length; i += batchSize) {
		const batch = validKanji.slice(i, i + batchSize);

		// Process batch
		for (const row of batch) {
			try {
				const result = await processKanjiRow(row);
				if (result.inserted) inserted++;
				if (result.updated) updated++;
			} catch (error) {
				console.error(`   ❌ Error processing kanji ${row.kanji}:`, error);
			}
		}

		if ((i + batchSize) % 500 === 0 || i + batchSize >= validKanji.length) {
			console.log(
				`   ⏳ Processed ${Math.min(i + batchSize, validKanji.length)}/${validKanji.length}...`,
			);
		}
	}

	return { inserted, updated, total: inserted + updated };
}

/**
 * Get all CSV files from a directory
 */
async function getCsvFiles(dirPath: string): Promise<string[]> {
	const files = await fs.readdir(dirPath);
	return files
		.filter((file) => file.toLowerCase().endsWith('.csv'))
		.map((file) => path.join(dirPath, file))
		.sort(); // Sort for consistent processing order
}

/**
 * Check if path is a directory
 */
async function isDirectory(filePath: string): Promise<boolean> {
	try {
		const stats = await fs.stat(filePath);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

async function seedKanji(csvPath?: string) {
	console.log('🌱 Starting kanji seeding from CSV...\n');

	const defaultPath = path.join(process.cwd(), 'data', 'kanji-seed.csv');
	const inputPath = csvPath || defaultPath;

	try {
		// Check if path exists
		await fs.access(inputPath);

		const isDir = await isDirectory(inputPath);
		let csvFiles: string[];

		if (isDir) {
			// Process all CSV files in directory
			csvFiles = await getCsvFiles(inputPath);
			if (csvFiles.length === 0) {
				throw new Error(`No CSV files found in directory: ${inputPath}`);
			}
			console.log(`📁 Found ${csvFiles.length} CSV file(s) in directory`);
		} else {
			// Process single file
			csvFiles = [inputPath];
		}

		// Process all files
		let totalInserted = 0;
		let totalUpdated = 0;
		let totalProcessed = 0;

		for (let i = 0; i < csvFiles.length; i++) {
			const file = csvFiles[i];
			try {
				const result = await processCsvFile(file);
				totalInserted += result.inserted;
				totalUpdated += result.updated;
				totalProcessed += result.total;
			} catch (error) {
				console.error(`\n❌ Error processing file ${path.basename(file)}:`, error);
				// Continue with next file
			}
		}

		console.log(`\n${'='.repeat(50)}`);
		console.log(`✅ Successfully seeded kanji from ${csvFiles.length} file(s):`);
		console.log(`   📝 Inserted: ${totalInserted}`);
		console.log(`   🔄 Updated: ${totalUpdated}`);
		console.log(`   📊 Total: ${totalProcessed}`);
		console.log(`${'='.repeat(50)}`);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			console.error(`❌ Path not found: ${inputPath}`);
			console.error(`💡 Please ensure the CSV file or directory exists`);
		} else {
			console.error('❌ Error seeding kanji:', error);
		}
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run if called directly (ES module pattern)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
	const csvPath = process.argv[2];
	seedKanji(csvPath)
		.then(() => {
			console.log('Seeding complete');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seeding failed:', error);
			process.exit(1);
		});
}

export { seedKanji };
