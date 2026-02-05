/**
 * Kana Reference – single source of truth for Hiragana and Katakana gojūon + dakuten
 * Standard order: rows by consonant (—, K, S, T, N, H, M, Y, R, W, N), columns a/i/u/e/o.
 * Empty slots for missing combinations (yi, ye, wi, we, wu).
 * Dakuten: G, Z, D, B, P rows (が〜ぽ / ガ〜ポ).
 */
import { COLUMN_HEADERS, ROW_HEADERS_DAKUTEN, ROW_HEADERS_GOJUON } from '../constants';
import type { KanaCell, KanaGrid, KanaRow, KanaScript, KanaSection } from '../types';

const HIRAGANA_GOJUON: (string | null)[][] = [
	['あ', 'い', 'う', 'え', 'お'],
	['か', 'き', 'く', 'け', 'こ'],
	['さ', 'し', 'す', 'せ', 'そ'],
	['た', 'ち', 'つ', 'て', 'と'],
	['な', 'に', 'ぬ', 'ね', 'の'],
	['は', 'ひ', 'ふ', 'へ', 'ほ'],
	['ま', 'み', 'む', 'め', 'も'],
	['や', null, 'ゆ', null, 'よ'],
	['ら', 'り', 'る', 'れ', 'ろ'],
	['わ', null, null, null, 'を'],
	['ん', null, null, null, null],
];

const HIRAGANA_ROMAJI: (string | null)[][] = [
	['a', 'i', 'u', 'e', 'o'],
	['ka', 'ki', 'ku', 'ke', 'ko'],
	['sa', 'shi', 'su', 'se', 'so'],
	['ta', 'chi', 'tsu', 'te', 'to'],
	['na', 'ni', 'nu', 'ne', 'no'],
	['ha', 'hi', 'fu', 'he', 'ho'],
	['ma', 'mi', 'mu', 'me', 'mo'],
	['ya', null, 'yu', null, 'yo'],
	['ra', 'ri', 'ru', 're', 'ro'],
	['wa', null, null, null, 'wo'],
	['n', null, null, null, null],
];

const KATAKANA_GOJUON: (string | null)[][] = [
	['ア', 'イ', 'ウ', 'エ', 'オ'],
	['カ', 'キ', 'ク', 'ケ', 'コ'],
	['サ', 'シ', 'ス', 'セ', 'ソ'],
	['タ', 'チ', 'ツ', 'テ', 'ト'],
	['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
	['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
	['マ', 'ミ', 'ム', 'メ', 'モ'],
	['ヤ', null, 'ユ', null, 'ヨ'],
	['ラ', 'リ', 'ル', 'レ', 'ロ'],
	['ワ', null, null, null, 'ヲ'],
	['ン', null, null, null, null],
];

const KATAKANA_ROMAJI: (string | null)[][] = [
	['a', 'i', 'u', 'e', 'o'],
	['ka', 'ki', 'ku', 'ke', 'ko'],
	['sa', 'shi', 'su', 'se', 'so'],
	['ta', 'chi', 'tsu', 'te', 'to'],
	['na', 'ni', 'nu', 'ne', 'no'],
	['ha', 'hi', 'fu', 'he', 'ho'],
	['ma', 'mi', 'mu', 'me', 'mo'],
	['ya', null, 'yu', null, 'yo'],
	['ra', 'ri', 'ru', 're', 'ro'],
	['wa', null, null, null, 'wo'],
	['n', null, null, null, null],
];

function buildGrid(
	chars: (string | null)[][],
	romaji: (string | null)[][],
	script: KanaScript,
	section: KanaSection,
	rowHeaders: readonly string[],
): KanaGrid {
	const rows: KanaRow[] = chars.map((rowChars, rowIndex) => {
		const cells: (KanaCell | null)[] = rowChars.map((char, colIndex) => {
			const rom = romaji[rowIndex]?.[colIndex];
			if (char == null || rom == null) return null;
			return {
				id: `${script}_${section}_${char}`,
				character: char,
				romaji: rom,
				script,
				section,
			};
		});
		return {
			rowHeader: rowHeaders[rowIndex] ?? '—',
			cells,
		};
	});
	return {
		rows,
		columnHeaders: COLUMN_HEADERS,
	};
}

/** Hiragana basic (gojūon) grid: あ through ん */
export function getHiraganaBasic(): KanaGrid {
	return buildGrid(HIRAGANA_GOJUON, HIRAGANA_ROMAJI, 'hiragana', 'basic', ROW_HEADERS_GOJUON);
}

/** Katakana basic (gojūon) grid: ア through ン */
export function getKatakanaBasic(): KanaGrid {
	return buildGrid(KATAKANA_GOJUON, KATAKANA_ROMAJI, 'katakana', 'basic', ROW_HEADERS_GOJUON);
}

// --- Dakuten & Handakuten ---

const HIRAGANA_DAKUTEN: (string | null)[][] = [
	['が', 'ぎ', 'ぐ', 'げ', 'ご'],
	['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
	['だ', 'ぢ', 'づ', 'で', 'ど'],
	['ば', 'び', 'ぶ', 'べ', 'ぼ'],
	['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
];

const HIRAGANA_DAKUTEN_ROMAJI: (string | null)[][] = [
	['ga', 'gi', 'gu', 'ge', 'go'],
	['za', 'ji', 'zu', 'ze', 'zo'],
	['da', 'ji', 'zu', 'de', 'do'],
	['ba', 'bi', 'bu', 'be', 'bo'],
	['pa', 'pi', 'pu', 'pe', 'po'],
];

const KATAKANA_DAKUTEN: (string | null)[][] = [
	['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
	['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
	['ダ', 'ヂ', 'ヅ', 'デ', 'ド'],
	['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
	['パ', 'ピ', 'プ', 'ペ', 'ポ'],
];

const KATAKANA_DAKUTEN_ROMAJI: (string | null)[][] = [
	['ga', 'gi', 'gu', 'ge', 'go'],
	['za', 'ji', 'zu', 'ze', 'zo'],
	['da', 'ji', 'zu', 'de', 'do'],
	['ba', 'bi', 'bu', 'be', 'bo'],
	['pa', 'pi', 'pu', 'pe', 'po'],
];

/** Hiragana dakuten & handakuten: が through ぽ */
export function getHiraganaDakuten(): KanaGrid {
	return buildGrid(
		HIRAGANA_DAKUTEN,
		HIRAGANA_DAKUTEN_ROMAJI,
		'hiragana',
		'dakuten',
		ROW_HEADERS_DAKUTEN,
	);
}

/** Katakana dakuten & handakuten: ガ through ポ */
export function getKatakanaDakuten(): KanaGrid {
	return buildGrid(
		KATAKANA_DAKUTEN,
		KATAKANA_DAKUTEN_ROMAJI,
		'katakana',
		'dakuten',
		ROW_HEADERS_DAKUTEN,
	);
}
