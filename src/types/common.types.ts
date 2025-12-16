export type SortState = 'date' | 'alpha' | 'importance';
export type FilterState = 'all' | 'new' | 'learning' | 'review' | 'mastered';
export type CardState = 'new' | 'learning' | 'review' | 'mastered' | 'relearning';

// Dashboard Data Types
export interface VocabDataType {
	id: string;
	wordSurface: string;
	readingKana: string;
	meaning: string;
	hanViet: string;
	deckName: string;
	state: CardState;
	nextReview?: Date; // For sorting/insight
	createdAt?: Date;
}

export interface KanjiDataType {
	id: string;
	kanji: string;
	onyomi: string[];
	kunyomi: string[];
	meaning: string;
	hanViet: string;
	strokes: number;
	deckName: string;
	state: CardState; // Derived from studyCard
	nextReview?: Date;
	createdAt?: Date;
}
