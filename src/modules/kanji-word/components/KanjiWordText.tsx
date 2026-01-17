/**
 * KanjiWordText Component
 *
 * Wrapper component that auto-detects and wraps kanji in text
 * Usage: <KanjiWordText>私は学校に行きます</KanjiWordText>
 */
'use client';

import type { KanjiWordSize, ReadingMode } from '../types';
import { KanjiWord } from './KanjiWord';
import { useKanjiWordContext } from './KanjiWordProvider';

interface KanjiWordTextProps {
	children: string;
	readingMode?: ReadingMode;
	size?: KanjiWordSize;
	showCategoryUnderline?: boolean;
	interactive?: boolean;
}

export function KanjiWordText({
	children,
	readingMode,
	size,
	showCategoryUnderline,
	interactive = true,
}: KanjiWordTextProps) {
	const { parseText } = useKanjiWordContext();

	// Parse text into segments
	const segments = parseText(children);

	// Fallback: if no segments returned, render as plain text
	if (!segments || segments.length === 0) {
		return <span>{children}</span>;
	}

	return (
		<>
			{segments.map((segment, idx) => {
				if (segment.type === 'text') {
					return <span key={idx}>{segment.content}</span>;
				}

				// Kanji segment - render as KanjiWord even without vocab
				// KanjiWord will fetch vocab on hover if not available
				return (
					<KanjiWord
						key={idx}
						vocab={segment.vocab}
						wordSurface={segment.content}
						readingMode={readingMode}
						size={size}
						showCategoryUnderline={showCategoryUnderline}
						interactive={interactive}
					/>
				);
			})}
		</>
	);
}
