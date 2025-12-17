import { useEffect } from 'react';

interface UseStudyShortcutsProps {
	onSpace: () => void;
	onRate: (rating: number) => void;
	onAudio?: () => void;
	onExampleAudio?: () => void;
	onToggleHeader?: () => void;
	onEscape?: () => void;
	disabled?: boolean;
	showAnswer: boolean;
}

export function useStudyShortcuts({
	onSpace,
	onRate,
	onAudio,
	onExampleAudio,
	onToggleHeader,
	onEscape,
	disabled = false,
	showAnswer,
}: UseStudyShortcutsProps) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Disable shortcuts if typing in an input
			const target = e.target as HTMLElement;
			const isInput =
				target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

			if (e.key === 'Escape' || e.code === 'Escape') {
				onEscape?.();
				// Don't return here, let other logic potentially run if needed (though usually escape covers it)
				// Actually for modal closing it's better to just return after handling
				return;
			}

			if (disabled || isInput) return;

			if (e.code === 'Space') {
				if (e.repeat) return; // Prevent holding key
				e.preventDefault(); // Prevent scrolling
				onSpace();
			} else if (showAnswer) {
				// Rating Keys 1-4
				switch (e.key) {
					case '1':
						onRate(1); // Again
						break;
					case '2':
						onRate(2); // Hard
						break;
					case '3':
						onRate(3); // Good
						break;
					case '4':
						onRate(4); // Easy
						break;
				}
			}

			// Header Toggle (H key)
			if (e.key.toLowerCase() === 'h') {
				onToggleHeader?.();
			}

			// Audio Shortcuts
			if (e.key.toLowerCase() === 'r') {
				onAudio?.();
			} else if (e.key.toLowerCase() === 'e') {
				onExampleAudio?.();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [disabled, showAnswer, onSpace, onRate, onAudio, onExampleAudio, onToggleHeader, onEscape]);
}
