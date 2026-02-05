/**
 * WordWithFurigana – Shared presentational component
 *
 * Renders Japanese word surface with ruby furigana (reading above kanji).
 * - If word has kanji: show furigana when possible; else show surface + reading line.
 * - If word is kana-only (hiragana/katakana): show plain wordSurface only (no reading line).
 *
 * Reused in deck list, grid, flashcard preview, KanjiWord, etc.
 */

'use client';

import type { FuriganaMapping } from '@/lib/schemas/jsonb';
import { generateFuriganaMapping, hasKanji, renderFurigana } from '@/lib/utils/furigana';
import { Typography, theme } from 'antd';
import React from 'react';

const { Text } = Typography;

export interface WordWithFuriganaProps {
	wordSurface: string;
	wordReading?: string | null;
	furiganaMapping?: FuriganaMapping | null;
	/** Show reading (kana) below the word only when furigana is not shown. Default true. */
	showReadingLine?: boolean;
	/** Font size for the main word. Default 16. */
	fontSize?: number | string;
	/** Font size for ruby <rt>. Default 10. */
	rtFontSize?: number | string;
	/** Wrapper element. Use 'span' for inline (e.g. KanjiWord). Default 'div'. */
	as?: 'div' | 'span';
	className?: string;
	style?: React.CSSProperties;
}

export function WordWithFurigana({
	wordSurface,
	wordReading,
	furiganaMapping,
	showReadingLine = true,
	fontSize = 17,
	rtFontSize = 10,
	as = 'div',
	className,
	style,
}: WordWithFuriganaProps) {
	const { token } = theme.useToken();

	const hasKanjiInSurface = hasKanji(wordSurface);
	const shouldShowFurigana = wordReading && hasKanjiInSurface;
	const effectiveMapping =
		furiganaMapping ||
		(shouldShowFurigana && wordReading ? generateFuriganaMapping(wordSurface, wordReading) : null);
	const furiganaSegments = effectiveMapping ? renderFurigana(wordSurface, effectiveMapping) : null;

	const hasRuby = furiganaSegments?.some((s) => s.isKanji && s.reading);
	// Show reading line only when: not showing furigana, and surface has kanji (so reading is useful).
	// For kana-only (hiragana/katakana) words, show plain wordSurface only.
	const showReading = showReadingLine && wordReading && !hasRuby && hasKanjiInSurface;

	const content = (
		<>
			<Text strong style={{ fontSize, lineHeight: 1.3 }}>
				{hasRuby ? (
					<ruby style={{ rubyAlign: 'start' }}>
						{furiganaSegments!.map((segment, idx) =>
							segment.isKanji && segment.reading ? (
								<ruby key={idx} style={{ rubyAlign: 'start' }}>
									{segment.text}
									<rt
										style={{
											fontSize: rtFontSize,
											color: token.colorTextSecondary,
											fontWeight: 'normal',
										}}
									>
										{segment.reading}
									</rt>
								</ruby>
							) : (
								<span key={idx}>{segment.text}</span>
							),
						)}
					</ruby>
				) : (
					wordSurface
				)}
			</Text>
			{showReading && (
				<div style={{ fontSize: 12, color: token.colorTextSecondary }}>{wordReading}</div>
			)}
		</>
	);

	return React.createElement(as, { className, style }, content);
}
