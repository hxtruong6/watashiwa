import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUT_DIR = path.join(DATA_DIR, 'seed', 'minna_raw');
const ALL_DECKS_PATH = path.join(DATA_DIR, 'All Decks_2.txt');
const MISSING_CANDIDATES_PATH = path.join(DATA_DIR, 'missing_candidates.json');
const CUBE_DATA_PATH = path.join(DATA_DIR, 'cube_processing_data.md');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
	fs.mkdirSync(OUT_DIR, { recursive: true });
}

interface UnitSegments {
	unit: number;
	segments: { start: number; end: number }[];
}

interface WordItem {
	word_surface: string;
	han_viet: string;
	kana: string;
	romaji: string;
	meanings: {
		vi: string[];
		en: string[];
	};
	tags: string[];
	etymology?: any;
	examples?: any[];
	mnemonic?: any;
	confusions?: any[];
	pitch_pattern?: number;
	pitch_svg_path?: string;
}

// 1. Parse Unit Ranges from Markdown
function parseUnitRanges(): UnitSegments[] {
	const content = fs.readFileSync(CUBE_DATA_PATH, 'utf-8');
	const lines = content.split('\n');
	const unitSegmentsList: UnitSegments[] = [];

	for (const line of lines) {
		if (!line.includes('|')) continue;

		const cells = line.split('|').map((c) => c.trim());
		if (cells.length < 5) continue;

		// Cell 1: Unit number (e.g. "**01**")
		const unitMatch = cells[1].match(/\*\*(\d+)\*\*/);
		if (!unitMatch) continue;
		const unit = parseInt(unitMatch[1], 10);

		const rangeCell = cells[4];
		const segments: { start: number; end: number }[] = [];

		// 1. Match Ranges "100-200"
		const rangeMatches = [...rangeCell.matchAll(/(\d+)-(\d+)/g)];
		for (const m of rangeMatches) {
			segments.push({ start: parseInt(m[1], 10), end: parseInt(m[2], 10) });
		}

		// 2. Match Single Additions "+957" or "+1059"
		const plusMatches = [...rangeCell.matchAll(/\+(\d+)/g)];
		for (const m of plusMatches) {
			const val = parseInt(m[1], 10);
			segments.push({ start: val, end: val });
		}

		if (segments.length > 0) {
			unitSegmentsList.push({ unit, segments });
		} else {
			// Warn if no segments found, unless it's a manual unit without lines
			// Check if there are other indicators, but for now log warning
			console.warn(`Unit ${unit}: No valid ranges found in "${rangeCell}"`);
			// We still add the unit so we can generate 'Missing Only' files if needed
			unitSegmentsList.push({ unit, segments: [] });
		}
	}
	return unitSegmentsList;
}

// 2. Parse All Decks Data
function parseAllDecksLine(line: string): WordItem | null {
	const parts = line.split('\t');
	if (parts.length < 5) return null;

	const surface = parts[1].trim();
	const kana = parts[2].trim();
	const meaningVi = parts[3].trim();
	const hanViet = parts[4].trim();
	const romaji = '';

	return {
		word_surface: surface || kana,
		han_viet: hanViet,
		kana: kana,
		romaji: romaji,
		meanings: {
			vi: [meaningVi],
			en: [],
		},
		tags: [],
		pitch_pattern: 0,
		pitch_svg_path: '',
		etymology: { parts: [], note: { vi: '', en: '' } },
		examples: [],
		mnemonic: { vi: '', en: '' },
		confusions: [],
	};
}

function getAllDecksData(): string[] {
	return fs.readFileSync(ALL_DECKS_PATH, 'utf-8').split('\n');
}

// 3. Parse Missing Candidates
function getMissingCandidates(): Map<number, WordItem[]> {
	const content = fs.readFileSync(MISSING_CANDIDATES_PATH, 'utf-8');
	const data = JSON.parse(content);
	const map = new Map<number, WordItem[]>();

	for (const item of data) {
		const unit = item.unit;
		if (!unit) continue;

		if (!map.has(unit)) {
			map.set(unit, []);
		}

		const wordItem: WordItem = {
			word_surface: item.kanji || item.kana,
			han_viet: '',
			kana: item.kana,
			romaji: item.romaji || '',
			meanings: {
				vi: [],
				en: item.meaning?.en ? [item.meaning.en] : [],
			},
			tags: ['missing_candidate'],
			pitch_pattern: 0,
			pitch_svg_path: '',
			etymology: { parts: [], note: { vi: '', en: '' } },
			examples: [],
			mnemonic: { vi: '', en: '' },
			confusions: [],
		};
		map.get(unit)?.push(wordItem);
	}
	return map;
}

// Main Execution
async function main() {
	console.log('Starting Multi-Segment Unit Scaffolding...');

	const unitSegmentsList = parseUnitRanges();
	console.log(`Found definitions for ${unitSegmentsList.length} units.`);

	const allDecksLines = getAllDecksData();
	const missingCandidatesMap = getMissingCandidates();

	for (const unitData of unitSegmentsList) {
		const unitNum = unitData.unit;
		const unitStr = unitNum.toString().padStart(2, '0');
		const fileName = `unit${unitStr}.json`;
		const filePath = path.join(OUT_DIR, fileName);

		const unitItems: WordItem[] = [];

		// Process Segments
		for (const segment of unitData.segments) {
			// Markdown lines are 1-based. Array is 0-based.
			// Start inclusive, End inclusive.
			for (let i = segment.start - 1; i < segment.end; i++) {
				if (i >= allDecksLines.length) break;
				const line = allDecksLines[i];
				if (!line.trim()) continue;

				const item = parseAllDecksLine(line);
				if (item) {
					item.tags.push(`unit-${unitNum}`);
					unitItems.push(item);
				}
			}
		}

		// Append Missing Candidates
		const missing = missingCandidatesMap.get(unitNum) || [];
		missing.forEach((m) => m.tags.push(`unit-${unitNum}`));
		unitItems.push(...missing);

		fs.writeFileSync(filePath, JSON.stringify(unitItems, null, 2));
		console.log(
			`Generated ${fileName}: ${unitItems.length} items (${unitItems.length - missing.length} from deck, ${missing.length} missing)`,
		);
	}

	console.log('Scaffolding Complete.');
}

main().catch(console.error);
