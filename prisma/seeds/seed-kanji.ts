/**
 * Kanji Seeding Script (CSV Import with Extended Data)
 *
 * Seeds the Kanji table from two CSV files:
 * - Main file: Contains readings, frequency, JLPT, stroke count
 * - Extended file: Contains enhanced meaning, meaning_vi, han_viet
 *
 * Usage:
 *   pnpm tsx prisma/seeds/seed-kanji.ts [path-to-main-csv-or-directory]
 *
 * Examples:
 *   pnpm tsx prisma/seeds/seed-kanji.ts ./data/kanji_batch_1.csv
 *   pnpm tsx prisma/seeds/seed-kanji.ts /path/to/csv/directory
 *
 * File Naming Pattern:
 *   Main file: kanji_batch_1.csv
 *   Extended file: kanji_batch_1_extend.csv (auto-detected)
 */
import { parse } from 'csv-parse';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { prisma } from '../../src/lib/db';

interface KanjiMainRow {
	kanji: string;
	onyomi: string;
	kunyomi: string;
	nanori: string;
	meaning: string; // Will be overridden by extended file
	freq: string;
	jlpt: string;
	stroke_count: string;
	meaning_vi: string; // Will be overridden by extended file
	han_viet: string; // Will be overridden by extended file
}

interface KanjiExtendedRow {
	kanji: string;
	meaning: string;
	meaning_vi: string;
	han_viet: string;
}

interface MergedKanjiRow {
	kanji: string;
	onyomi: string;
	kunyomi: string;
	nanori: string;
	meaning: string; // From extended file
	freq: string;
	jlpt: string;
	stroke_count: string;
	meaning_vi: string; // From extended file
	han_viet: string; // From extended file
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
 * Parse main CSV file (with all columns)
 */
async function parseMainCsvFile(filePath: string): Promise<KanjiMainRow[]> {
	const content = await fs.readFile(filePath, 'utf-8');

	const records: Record<string, string>[] = [];
	const parser = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true,
		cast: false,
	});

	for await (const record of parser) {
		records.push(record as Record<string, string>);
	}

	if (records.length === 0) {
		throw new Error('Main CSV file contains no data rows');
	}

	// Validate required columns
	const firstRow = records[0];
	const requiredColumns = [
		'kanji',
		'onyomi',
		'kunyomi',
		'nanori',
		'meaning',
		'freq',
		'jlpt',
		'stroke_count',
		'meaning_vi',
		'han_viet',
	];

	const missingColumns = requiredColumns.filter((col) => !(col in firstRow));
	if (missingColumns.length > 0) {
		throw new Error(
			`Main CSV missing required columns: ${missingColumns.join(', ')}\nFound columns: ${Object.keys(firstRow).join(', ')}`,
		);
	}

	// Transform to typed rows
	const rows: KanjiMainRow[] = [];
	for (const record of records) {
		const kanji = record.kanji?.trim();
		if (!kanji || kanji.length !== 1) {
			continue; // Skip invalid kanji
		}

		rows.push({
			kanji,
			onyomi: record.onyomi?.trim() || '',
			kunyomi: record.kunyomi?.trim() || '',
			nanori: record.nanori?.trim() || '',
			meaning: record.meaning?.trim() || '',
			freq: record.freq?.trim() || '',
			jlpt: record.jlpt?.trim() || '',
			stroke_count: record.stroke_count?.trim() || '',
			meaning_vi: record.meaning_vi?.trim() || '',
			han_viet: record.han_viet?.trim() || '',
		});
	}

	return rows;
}

/**
 * Parse extended CSV file (with enhanced meaning data)
 */
async function parseExtendedCsvFile(filePath: string): Promise<KanjiExtendedRow[]> {
	const content = await fs.readFile(filePath, 'utf-8');

	const records: Record<string, string>[] = [];
	const parser = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true,
		cast: false,
	});

	for await (const record of parser) {
		records.push(record as Record<string, string>);
	}

	if (records.length === 0) {
		throw new Error('Extended CSV file contains no data rows');
	}

	// Validate required columns
	const firstRow = records[0];
	const requiredColumns = ['kanji', 'meaning', 'meaning_vi', 'han_viet'];

	const missingColumns = requiredColumns.filter((col) => !(col in firstRow));
	if (missingColumns.length > 0) {
		throw new Error(
			`Extended CSV missing required columns: ${missingColumns.join(', ')}\nFound columns: ${Object.keys(firstRow).join(', ')}`,
		);
	}

	// Transform to typed rows
	const rows: KanjiExtendedRow[] = [];
	for (const record of records) {
		const kanji = record.kanji?.trim();
		if (!kanji || kanji.length !== 1) {
			continue; // Skip invalid kanji
		}

		rows.push({
			kanji,
			meaning: record.meaning?.trim() || '',
			meaning_vi: record.meaning_vi?.trim() || '',
			han_viet: record.han_viet?.trim() || '',
		});
	}

	return rows;
}

/**
 * Find extended CSV file path from main file path
 * Pattern: kanji_batch_1.csv -> kanji_batch_1_extend.csv
 */
function getExtendedFilePath(mainFilePath: string): string {
	const dir = path.dirname(mainFilePath);
	const basename = path.basename(mainFilePath, path.extname(mainFilePath));
	const extendedBasename = `${basename}_extend.csv`;
	return path.join(dir, extendedBasename);
}

/**
 * Validate and merge main and extended CSV data
 * Throws error if files don't match (different count or order)
 */
function mergeCsvData(
	mainRows: KanjiMainRow[],
	extendedRows: KanjiExtendedRow[],
): MergedKanjiRow[] {
	// Validate same number of rows
	if (mainRows.length !== extendedRows.length) {
		throw new Error(
			`CSV files have different number of kanji entries!\nMain: ${mainRows.length}, Extended: ${extendedRows.length}\nFiles are corrupted or don't match.`,
		);
	}

	// Validate same kanji in same order
	const merged: MergedKanjiRow[] = [];
	for (let i = 0; i < mainRows.length; i++) {
		const mainRow = mainRows[i];
		const extendedRow = extendedRows[i];

		// Validate kanji match
		if (mainRow.kanji !== extendedRow.kanji) {
			throw new Error(
				`CSV files have mismatched kanji at row ${i + 1}!\nMain: "${mainRow.kanji}", Extended: "${extendedRow.kanji}"\nFiles are corrupted or don't match.`,
			);
		}

		// Merge data (use extended file's meaning, meaning_vi, han_viet)
		merged.push({
			kanji: mainRow.kanji,
			onyomi: mainRow.onyomi,
			kunyomi: mainRow.kunyomi,
			nanori: mainRow.nanori,
			meaning: extendedRow.meaning, // From extended file
			freq: mainRow.freq,
			jlpt: mainRow.jlpt,
			stroke_count: mainRow.stroke_count,
			meaning_vi: extendedRow.meaning_vi, // From extended file
			han_viet: extendedRow.han_viet, // From extended file
		});
	}

	return merged;
}

/**
 * Transform merged CSV row to Prisma data format
 */
function transformRowToData(row: MergedKanjiRow) {
	// Parse readings (combine kunyomi and nanori)
	const onyomiReadings = parseReadings(row.onyomi);
	const kunyomiReadings = [...parseReadings(row.kunyomi), ...parseReadings(row.nanori)].filter(
		(r) => r !== '',
	);

	// Parse numeric fields
	const jlptLevel = row.jlpt ? parseInt(row.jlpt, 10) : null;
	const strokeCount = parseInt(row.stroke_count || '0', 10);
	const frequency = row.freq ? parseInt(row.freq, 10) : null;

	return {
		character: row.kanji,
		meaningVi: row.meaning_vi || null,
		meaningEn: row.meaning || null,
		// Convert han_viet to uppercase (Hán Việt is always uppercase)
		hanViet: row.han_viet ? row.han_viet.toUpperCase().trim() : null,
		onyomiReadings,
		kunyomiReadings,
		jlptLevel: jlptLevel && !isNaN(jlptLevel) ? jlptLevel : null,
		strokeCount: isNaN(strokeCount) ? 0 : strokeCount,
		frequency: frequency && !isNaN(frequency) ? frequency : null,
	};
}

/**
 * Batch upsert kanji records with optimized performance
 */
async function batchUpsertKanji(
	rows: MergedKanjiRow[],
): Promise<{ inserted: number; updated: number }> {
	if (rows.length === 0) {
		return { inserted: 0, updated: 0 };
	}

	// Transform all rows to data format
	const dataMap = new Map<string, ReturnType<typeof transformRowToData>>();
	for (const row of rows) {
		if (row.kanji && row.kanji.length === 1) {
			dataMap.set(row.kanji, transformRowToData(row));
		}
	}

	const characters = Array.from(dataMap.keys());
	if (characters.length === 0) {
		return { inserted: 0, updated: 0 };
	}

	// Batch check existing records (single query)
	const existingRecords = await prisma.kanji.findMany({
		where: { character: { in: characters } },
		select: { character: true },
	});

	const existingCharacters = new Set(existingRecords.map((r) => r.character));

	// Use interactive transaction with increased timeout for large batches
	// Default timeout is 5s, but we need more for large batches
	// Calculate timeout: 60s base + 10ms per item (capped at 120s)
	const timeout = Math.min(120000, 60000 + characters.length * 10);

	// Execute transaction with increased timeout using interactive transaction API
	await prisma.$transaction(
		async (tx) => {
			// Execute all upserts in parallel within the transaction
			await Promise.all(
				characters.map((character) =>
					tx.kanji.upsert({
						where: { character },
						update: dataMap.get(character)!,
						create: dataMap.get(character)!,
					}),
				),
			);
		},
		{
			timeout, // Dynamic timeout based on batch size
			maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
		},
	);

	// Calculate statistics
	let inserted = 0;
	let updated = 0;
	for (const character of characters) {
		if (existingCharacters.has(character)) {
			updated++;
		} else {
			inserted++;
		}
	}

	return { inserted, updated };
}

/**
 * Process a single CSV file pair (main + extended)
 */
async function processCsvFilePair(
	mainFilePath: string,
): Promise<{ inserted: number; updated: number; total: number }> {
	const mainBasename = path.basename(mainFilePath);
	const extendedFilePath = getExtendedFilePath(mainFilePath);

	console.log(`\n📄 Processing: ${mainBasename}`);
	console.log(`   📄 Extended: ${path.basename(extendedFilePath)}`);

	// Check if extended file exists
	try {
		await fs.access(extendedFilePath);
	} catch {
		throw new Error(
			`Extended file not found: ${extendedFilePath}\nExpected pattern: ${path.basename(mainFilePath)} -> ${path.basename(extendedFilePath)}`,
		);
	}

	// Parse both CSV files
	const mainRows = await parseMainCsvFile(mainFilePath);
	const extendedRows = await parseExtendedCsvFile(extendedFilePath);

	console.log(`   📖 Main file: ${mainRows.length} kanji entries`);
	console.log(`   📖 Extended file: ${extendedRows.length} kanji entries`);

	// Validate and merge
	let mergedRows: MergedKanjiRow[];
	try {
		mergedRows = mergeCsvData(mainRows, extendedRows);
		console.log(`   ✅ Validated: ${mergedRows.length} kanji entries match`);
	} catch (error) {
		console.error(`   ❌ Validation failed:`, error);
		throw error;
	}

	// Filter to valid entries
	const validKanji = mergedRows.filter((k) => k.kanji && k.kanji.length === 1);
	console.log(`   ✅ ${validKanji.length} valid kanji entries`);

	let inserted = 0;
	let updated = 0;

	// Process in optimized batches
	// Reduced batch size to avoid transaction timeouts
	const batchSize = 100;
	for (let i = 0; i < validKanji.length; i += batchSize) {
		const batch = validKanji.slice(i, i + batchSize);
		const batchNum = Math.floor(i / batchSize) + 1;
		const totalBatches = Math.ceil(validKanji.length / batchSize);

		console.log(`   🔍 Processing batch ${batchNum}/${totalBatches}...`);

		try {
			const result = await batchUpsertKanji(batch);
			inserted += result.inserted;
			updated += result.updated;
		} catch (error) {
			console.error(`   ❌ Error processing batch ${batchNum}:`, error);
			throw error; // Stop on error
		}

		// Progress logging
		const processed = Math.min(i + batchSize, validKanji.length);
		if (processed % 500 === 0 || processed >= validKanji.length) {
			console.log(`   ⏳ Processed ${processed}/${validKanji.length}...`);
		}
	}

	return { inserted, updated, total: inserted + updated };
}

/**
 * Get all main CSV files from a directory (exclude _extend files)
 */
async function getMainCsvFiles(dirPath: string): Promise<string[]> {
	const files = await fs.readdir(dirPath);
	return files
		.filter((file) => {
			const lower = file.toLowerCase();
			return lower.endsWith('.csv') && !lower.includes('_extend');
		})
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
	console.log('🌱 Starting kanji seeding from CSV (with extended data)...\n');

	const defaultPath = path.join(process.cwd(), 'data', 'kanji_batch_1.csv');
	const inputPath = csvPath || defaultPath;

	try {
		// Check if path exists
		await fs.access(inputPath);

		const isDir = await isDirectory(inputPath);
		let csvFiles: string[];

		if (isDir) {
			// Process all main CSV files in directory
			csvFiles = await getMainCsvFiles(inputPath);
			if (csvFiles.length === 0) {
				throw new Error(`No main CSV files found in directory: ${inputPath}`);
			}
			console.log(`📁 Found ${csvFiles.length} main CSV file(s) in directory`);
		} else {
			// Process single file
			csvFiles = [inputPath];
		}

		// Process all file pairs
		let totalInserted = 0;
		let totalUpdated = 0;
		let totalProcessed = 0;

		for (let i = 0; i < csvFiles.length; i++) {
			const file = csvFiles[i];
			try {
				const result = await processCsvFilePair(file);
				totalInserted += result.inserted;
				totalUpdated += result.updated;
				totalProcessed += result.total;
			} catch (error) {
				console.error(`\n❌ Error processing file ${path.basename(file)}:`, error);
				throw error; // Stop on error to prevent partial data
			}
		}

		console.log(`\n${'='.repeat(50)}`);
		console.log(`✅ Successfully seeded kanji from ${csvFiles.length} file pair(s):`);
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
