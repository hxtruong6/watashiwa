/**
 * KanjiWord Module - Constants
 *
 * Centralized constants for the KanjiWord module
 */

export const TOOLTIP_CONFIG = {
	WIDTH: 320,
	HEIGHT: 300,
	OFFSET: 8,
	Z_INDEX: 10000,
} as const;

export const SIZE_STYLES = {
	small: {
		fontSize: '14px',
		furiganaSize: '10px',
		romajiSize: '11px',
	},
	medium: {
		fontSize: '18px',
		furiganaSize: '12px',
		romajiSize: '13px',
	},
	large: {
		fontSize: '24px',
		furiganaSize: '14px',
		romajiSize: '15px',
	},
} as const;

export const JLPT_COLORS = {
	N5: '#4CAF50', // Green
	N4: '#2196F3', // Blue
	N3: '#FF9800', // Orange
	N2: '#F44336', // Red
	N1: '#9C27B0', // Purple
} as const;

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
