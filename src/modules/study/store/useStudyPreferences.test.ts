import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useStudyPreferences } from './useStudyPreferences';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

describe('useStudyPreferences - Algorithm Mode', () => {
	beforeEach(() => {
		localStorageMock.clear();
	});

	it('should default to SRS mode (safe fallback)', () => {
		const { result } = renderHook(() => useStudyPreferences());

		expect(result.current.algorithmMode).toBe('srs');
	});

	it('should update algorithm mode correctly', () => {
		const { result } = renderHook(() => useStudyPreferences());

		act(() => {
			result.current.setAlgorithmMode('semantic');
		});

		expect(result.current.algorithmMode).toBe('semantic');
	});

	it('should persist algorithm mode to localStorage', () => {
		const { result } = renderHook(() => useStudyPreferences());

		act(() => {
			result.current.setAlgorithmMode('semantic');
		});

		// Wait for persist middleware to save
		act(() => {
			// Force a re-render to trigger persist
			result.current.setShowFurigana(true);
		});

		const stored = localStorageMock.getItem('watashi-study-prefs');
		expect(stored).toBeTruthy();
		if (stored) {
			const parsed = JSON.parse(stored);
			expect(parsed.state.algorithmMode).toBe('semantic');
		}
	});

	it('should restore algorithm mode from localStorage', () => {
		// Set initial state in localStorage
		localStorageMock.setItem(
			'watashi-study-prefs',
			JSON.stringify({
				state: {
					algorithmMode: 'semantic',
					showFurigana: true,
					showRomaji: false,
					autoPlayAudio: 'answer',
					showRatingText: true,
					cardBackSettings: {
						showEtymology: true,
						showConfusions: true,
						showMoreExamples: true,
						defaultCollapseState: {
							etymology: 'expanded',
							confusions: 'expanded',
							moreExamples: 'expanded',
						},
					},
				},
				version: 0,
			}),
		);

		const { result } = renderHook(() => useStudyPreferences());

		expect(result.current.algorithmMode).toBe('semantic');
	});

	it('should allow switching between modes', () => {
		const { result } = renderHook(() => useStudyPreferences());

		act(() => {
			result.current.setAlgorithmMode('semantic');
		});
		expect(result.current.algorithmMode).toBe('semantic');

		act(() => {
			result.current.setAlgorithmMode('srs');
		});
		expect(result.current.algorithmMode).toBe('srs');
	});
});
