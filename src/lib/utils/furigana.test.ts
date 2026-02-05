import { describe, expect, it } from 'vitest';

import { generateFuriganaMapping } from './furigana';

describe('generateFuriganaMapping', () => {
	describe('null and empty inputs', () => {
		it('returns null when wordSurface is empty', () => {
			expect(generateFuriganaMapping('', 'よみ')).toBeNull();
		});

		it('returns null when wordReading is empty', () => {
			expect(generateFuriganaMapping('読み', '')).toBeNull();
		});

		it('returns null when both are empty', () => {
			expect(generateFuriganaMapping('', '')).toBeNull();
		});
	});

	describe('no kanji', () => {
		it('returns null when surface is all hiragana', () => {
			expect(generateFuriganaMapping('ひらがな', 'ひらがな')).toBeNull();
		});

		it('returns null when surface is all katakana', () => {
			expect(generateFuriganaMapping('カタカナ', 'かたかな')).toBeNull();
		});
	});

	describe('single kanji + kana (fallback path)', () => {
		it('maps single kanji with following kana (休みます / やすみます)', () => {
			const result = generateFuriganaMapping('休みます', 'やすみます');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toEqual({
				kanji: '休',
				reading: 'やす',
				surfaceIndex: 0,
				readingStart: 0,
				readingEnd: 2,
			});
		});

		it('maps single kanji with leading kana', () => {
			const result = generateFuriganaMapping('お金', 'おかね');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toMatchObject({
				kanji: '金',
				reading: 'かね',
			});
		});
	});

	describe('duplicate kana in reading (length-based split)', () => {
		it('maps 紹介します correctly when し appears twice in reading', () => {
			const result = generateFuriganaMapping('紹介します', 'しょうかいします');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toEqual({
				kanji: '紹介',
				reading: 'しょうかい',
				surfaceIndex: 0,
				readingStart: 0,
				readingEnd: 5,
			});
		});

		it('maps 行きます correctly (い in い and き)', () => {
			const result = generateFuriganaMapping('行きます', 'いきます');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toMatchObject({
				kanji: '行',
				reading: 'い',
				surfaceIndex: 0,
			});
			expect(result?.mappings[0].readingEnd).toBe(1);
		});
	});

	describe('multiple kanji as single block', () => {
		it('maps 日本語 as one block (にほんご)', () => {
			const result = generateFuriganaMapping('日本語', 'にほんご');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toMatchObject({
				kanji: '日本語',
				reading: 'にほんご',
				surfaceIndex: 0,
				readingStart: 0,
			});
			expect(result?.mappings[0].readingEnd).toBe('にほんご'.length);
		});

		it('maps 学校 with trailing kana', () => {
			const result = generateFuriganaMapping('学校', 'がっこう');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toMatchObject({
				kanji: '学校',
				reading: 'がっこう',
				surfaceIndex: 0,
			});
		});
	});

	describe('trailing kanji (word ends with kanji)', () => {
		it('maps when surface ends with kanji only', () => {
			const wordReading = 'にほん';
			const result = generateFuriganaMapping('日本', wordReading);
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(1);
			expect(result?.mappings[0]).toMatchObject({
				kanji: '日本',
				reading: 'にほん',
				surfaceIndex: 0,
				readingStart: 0,
			});
			expect(result?.mappings[0].readingEnd).toBe(wordReading.length);
		});
	});

	describe('multiple kanji blocks separated by kana', () => {
		it('maps two blocks: kanji-kana-kanji (本を読む / ほんをよむ)', () => {
			const result = generateFuriganaMapping('本を読む', 'ほんをよむ');
			expect(result).not.toBeNull();
			expect(result?.mappings).toHaveLength(2);
			expect(result?.mappings[0]).toMatchObject({
				kanji: '本',
				reading: 'ほん',
				surfaceIndex: 0,
			});
			expect(result?.mappings[1]).toMatchObject({
				kanji: '読',
				reading: 'よ',
				surfaceIndex: 2,
			});
		});
	});

	describe('structure and indices', () => {
		it('returns object with mappings array', () => {
			const result = generateFuriganaMapping('休み', 'やすみ');
			expect(result).toEqual({ mappings: expect.any(Array) });
			expect(Array.isArray(result?.mappings)).toBe(true);
		});

		it('reading slice matches reading string', () => {
			const wordReading = 'しょうかいします';
			const result = generateFuriganaMapping('紹介します', wordReading);
			expect(result).not.toBeNull();
			const { readingStart, readingEnd } = result!.mappings[0];
			expect(wordReading.slice(readingStart, readingEnd)).toBe('しょうかい');
		});
	});
});
