/**
 * Kana Reference – URL search params (nuqs)
 * table: hiragana | katakana, section: basic | dakuten
 * Use nuqs/server so parsers are safe during SSR and when imported by client components.
 */
import { parseAsStringLiteral } from 'nuqs/server';

const TABLE_VALUES = ['hiragana', 'katakana'] as const;
const SECTION_VALUES = ['basic', 'dakuten'] as const;

export type KanaTableParam = (typeof TABLE_VALUES)[number];
export type KanaSectionParam = (typeof SECTION_VALUES)[number];

export const kanaParsers = {
	table: parseAsStringLiteral(TABLE_VALUES).withDefault('hiragana'),
	section: parseAsStringLiteral(SECTION_VALUES).withDefault('basic'),
};
