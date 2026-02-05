/**
 * Kana Reference – single source of truth for Hiragana and Katakana gojūon
 * Standard order: rows by consonant (—, K, S, T, N, H, M, Y, R, W, N), columns a/i/u/e/o.
 * Empty slots for missing combinations (yi, ye, wi, we, wu).
 */
import { COLUMN_HEADERS, ROW_HEADERS_GOJUON } from '../constants';
import type { KanaCell, KanaGrid, KanaRow, KanaScript } from '../types';

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
): KanaGrid {
	const rows: KanaRow[] = chars.map((rowChars, rowIndex) => {
		const cells: (KanaCell | null)[] = rowChars.map((char, colIndex) => {
			const rom = romaji[rowIndex]?.[colIndex];
			if (char == null || rom == null) return null;
			return {
				id: `${script}_${char}`,
				character: char,
				romaji: rom,
				script,
				section: 'basic',
			};
		});
		return {
			rowHeader: ROW_HEADERS_GOJUON[rowIndex] ?? '—',
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
	return buildGrid(HIRAGANA_GOJUON, HIRAGANA_ROMAJI, 'hiragana');
}

/** Katakana basic (gojūon) grid: ア through ン */
export function getKatakanaBasic(): KanaGrid {
	return buildGrid(KATAKANA_GOJUON, KATAKANA_ROMAJI, 'katakana');
}
