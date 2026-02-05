/**
 * Kana Reference – row/column labels and view constants
 */

export const ROW_HEADERS_GOJUON = [
	'—', // vowel row
	'K',
	'S',
	'T',
	'N',
	'H',
	'M',
	'Y',
	'R',
	'W',
	'N', // ん row
] as const;

export const COLUMN_HEADERS = ['a', 'i', 'u', 'e', 'o'] as const;

export type ColumnHeader = (typeof COLUMN_HEADERS)[number];

export type RowHeaderGojuon = (typeof ROW_HEADERS_GOJUON)[number];
