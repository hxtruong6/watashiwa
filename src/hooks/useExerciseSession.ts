import { useState, useCallback } from 'react';
import { Question, ExerciseSessionState } from '@/types/exercises';

interface UseExerciseSessionReturn extends ExerciseSessionState {
	startSession: (questions: Question[]) => void;
	submitAnswer: (answer: string) => void;
	nextQuestion: () => void;
	endSession: () => void;
	restartSession: () => void;
}

export function useExerciseSession(): UseExerciseSessionReturn {
	const [state, setState] = useState<ExerciseSessionState>({
		status: 'idle',
		queue: [],
		currentIndex: 0,
		score: 0,
		results: [],
	});

	const startSession = useCallback((questions: Question[]) => {
		setState({
			status: 'playing',
			queue: questions,
			currentIndex: 0,
			score: 0,
			results: [],
		});
	}, []);

	const submitAnswer = useCallback((answer: string) => {
		setState((prev) => {
			const currentQuestion = prev.queue[prev.currentIndex];
			const isCorrect = answer === currentQuestion.correctAnswer;

			// Record result
			const newResult = {
				id: currentQuestion.id,
				question: currentQuestion,
				userAnswer: answer,
				isCorrect,
			};

			return {
				...prev,
				score: isCorrect ? prev.score + 1 : prev.score,
				results: [...prev.results, newResult],
			};
		});
	}, []);

	const nextQuestion = useCallback(() => {
		setState((prev) => {
			const nextIndex = prev.currentIndex + 1;
			if (nextIndex >= prev.queue.length) {
				return {
					...prev,
					status: 'summary',
				};
			}
			return {
				...prev,
				currentIndex: nextIndex,
			};
		});
	}, []);

	const endSession = useCallback(() => {
		setState((prev) => ({
			...prev,
			status: 'summary',
		}));
	}, []);

	const restartSession = useCallback(() => {
		setState((prev) => ({
			status: 'playing',
			queue: prev.queue, // Reuse same questions or logic to strict shuffle outside?
			// Usually restart means play again same set or new set?
			// For now, let's reset provided queue. If user wants new questions, they should call startSession again with new data.
			currentIndex: 0,
			score: 0,
			results: [],
		}));
	}, []);

	return {
		...state,
		startSession,
		submitAnswer,
		nextQuestion,
		endSession,
		restartSession,
	};
}
