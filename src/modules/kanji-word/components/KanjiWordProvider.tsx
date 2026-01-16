/**
 * KanjiWordProvider Component
 *
 * Context provider for auto-detecting and wrapping kanji in text
 */
'use client';

import { createContext, useContext, useMemo } from 'react';

import type { Vocabulary } from '@prisma/client';

import { parseTextForKanji } from '../utils';
import type { KanjiWordProviderProps, ParsedKanjiSegment } from '../types';

interface KanjiWordContextValue {
	vocabCache: Map<string, Vocabulary>;
	enableAutoDetection: boolean;
	parseText: (text: string) => ParsedKanjiSegment[];
}

const KanjiWordContext = createContext<KanjiWordContextValue | null>(null);

export function KanjiWordProvider({
	children,
	vocabCache = new Map(),
	enableAutoDetection = true,
}: KanjiWordProviderProps) {
	const parseText = useMemo(
		() => (text: string) => {
			if (!enableAutoDetection) {
				// Return as single text segment
				return [
					{
						type: 'text' as const,
						content: text,
						startIndex: 0,
						endIndex: text.length,
					},
				];
			}
			return parseTextForKanji(text, vocabCache);
		},
		[enableAutoDetection, vocabCache],
	);

	const value = useMemo(
		() => ({
			vocabCache,
			enableAutoDetection,
			parseText,
		}),
		[vocabCache, enableAutoDetection, parseText],
	);

	return <KanjiWordContext.Provider value={value}>{children}</KanjiWordContext.Provider>;
}

export function useKanjiWordContext() {
	const context = useContext(KanjiWordContext);
	if (!context) {
		throw new Error('useKanjiWordContext must be used within KanjiWordProvider');
	}
	return context;
}
