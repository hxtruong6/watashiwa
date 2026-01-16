/**
 * KanjiWord Module - Barrel Exports
 *
 * Public API for the KanjiWord module
 */
export { KanjiWord } from './components/KanjiWord';
export { KanjiWordProvider, useKanjiWordContext } from './components/KanjiWordProvider';
export { KanjiWordText } from './components/KanjiWordText';
export { KanjiWordTooltip } from './components/KanjiWordTooltip';

export type {
	KanjiWordProps,
	KanjiWordTooltipProps,
	KanjiWordProviderProps,
	ParsedKanjiSegment,
	ReadingMode,
	KanjiWordSize,
	JLPTLevel,
} from './types';

export { getVocabCacheAction, getVocabCacheArrayAction } from './actions';
export { buildVocabCache } from './utils';
