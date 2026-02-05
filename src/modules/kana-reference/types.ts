/**
 * Kana Reference – domain types
 * Used by data layer and UI components.
 */

export type KanaScript = 'hiragana' | 'katakana';

export type KanaSection = 'basic' | 'dakuten';

/** Single cell: one kana character with romaji and metadata for filtering/accessibility */
export interface KanaCell {
	id: string;
	character: string;
	romaji: string;
	script: KanaScript;
	section: KanaSection;
}

/** One row in the grid: optional row header and cells (null = empty slot) */
export interface KanaRow {
	rowHeader: string;
	cells: (KanaCell | null)[];
}

/** Full grid for one script + section: rows with consistent column count (a,i,u,e,o) */
export interface KanaGrid {
	rows: KanaRow[];
	columnHeaders: readonly [string, string, string, string, string];
}
