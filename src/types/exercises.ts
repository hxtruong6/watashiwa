export type ExerciseType = 'multiple_choice' | 'listening' | 'typing';

export interface Question {
	id: string; // cardId
	type: ExerciseType;
	challenge: string; // The Kanji or Audio URL
	correctAnswer: string; // The value to match
	options?: string[]; // Distractors (for MCQ)
	// Optional metadata for display
	reading?: string;
	meaning?: string;
	hanViet?: string;
	audioUrl?: string;
}

export type ExerciseStatus = 'idle' | 'playing' | 'summary';

export interface ExerciseExample {
	id: string;
	question: Question;
	userAnswer?: string;
	isCorrect?: boolean;
}

export interface ExerciseSessionState {
	status: ExerciseStatus;
	queue: Question[];
	currentIndex: number;
	score: number;
	results: ExerciseExample[]; // Track detailed results for summary
}
