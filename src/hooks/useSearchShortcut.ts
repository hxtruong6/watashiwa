import { useEffect, useRef } from 'react';

interface UseSearchShortcutOptions {
	onSearch: () => void;
	disabled?: boolean;
}

/**
 * useSearchShortcut Hook
 * Handles keyboard shortcuts for search:
 * - Ctrl+S / Cmd+S (Windows/Linux/Mac)
 * - Typing "s" three times quickly (within 1 second)
 */
export function useSearchShortcut({ onSearch, disabled = false }: UseSearchShortcutOptions) {
	const sKeyPresses = useRef<number[]>([]);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Disable shortcuts if typing in an input
			const target = e.target as HTMLElement;
			const isInput =
				target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

			if (disabled || isInput) return;

			// Ctrl+S / Cmd+S shortcut
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				onSearch();
				return;
			}

			// Triple "s" detection (sss)
			if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
				const now = Date.now();
				sKeyPresses.current.push(now);

				// Keep only presses within last 1 second
				sKeyPresses.current = sKeyPresses.current.filter((time) => now - time < 1000);

				// If we have 3 presses within 1 second, trigger search
				if (sKeyPresses.current.length >= 3) {
					e.preventDefault();
					sKeyPresses.current = []; // Reset
					onSearch();
					return;
				}

				// Clear old presses after 1 second
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
				timeoutRef.current = setTimeout(() => {
					sKeyPresses.current = [];
				}, 1000);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [onSearch, disabled]);
}
