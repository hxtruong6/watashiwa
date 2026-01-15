/**
 * Video Module Constants
 *
 * Centralized configuration values for video learning feature
 */
export const VIDEO_CONFIG = {
	// Time update throttling (performance)
	TIME_UPDATE_THROTTLE_MS: 100,

	// Progress save configuration
	PROGRESS_SAVE_INTERVAL_MS: 5000,
	MIN_TIME_DELTA_SECONDS: 1,
	MAX_RETRIES: 3,
	RETRY_BASE_DELAY_MS: 2000,

	// Touch gesture configuration
	SWIPE_THRESHOLD_PX: 50,
	SEEK_STEP_SECONDS: 10,

	// Keyboard shortcuts
	KEYBOARD_SEEK_STEP_SECONDS: 5,
	KEYBOARD_VOLUME_STEP: 0.1,

	// Controls auto-hide
	CONTROLS_AUTO_HIDE_DELAY_MS: 3000,

	// Resume prompt
	RESUME_PROMPT_MIN_TIME_REMAINING_SECONDS: 5,

	// Completion detection
	COMPLETION_TOLERANCE_SECONDS: 0.5,
} as const;

// Export individual constants for easier imports
export const TIME_UPDATE_THROTTLE_MS = VIDEO_CONFIG.TIME_UPDATE_THROTTLE_MS;
export const PROGRESS_SAVE_INTERVAL_MS = VIDEO_CONFIG.PROGRESS_SAVE_INTERVAL_MS;
export const MIN_TIME_DELTA_SECONDS = VIDEO_CONFIG.MIN_TIME_DELTA_SECONDS;
export const MAX_RETRIES = VIDEO_CONFIG.MAX_RETRIES;
export const RETRY_BASE_DELAY_MS = VIDEO_CONFIG.RETRY_BASE_DELAY_MS;
export const SWIPE_THRESHOLD_PX = VIDEO_CONFIG.SWIPE_THRESHOLD_PX;
export const SEEK_STEP_SECONDS = VIDEO_CONFIG.SEEK_STEP_SECONDS;
export const KEYBOARD_SEEK_STEP_SECONDS = VIDEO_CONFIG.KEYBOARD_SEEK_STEP_SECONDS;
export const KEYBOARD_VOLUME_STEP = VIDEO_CONFIG.KEYBOARD_VOLUME_STEP;
export const CONTROLS_AUTO_HIDE_DELAY_MS = VIDEO_CONFIG.CONTROLS_AUTO_HIDE_DELAY_MS;
export const RESUME_PROMPT_MIN_TIME_REMAINING_SECONDS =
	VIDEO_CONFIG.RESUME_PROMPT_MIN_TIME_REMAINING_SECONDS;
export const COMPLETION_TOLERANCE_SECONDS = VIDEO_CONFIG.COMPLETION_TOLERANCE_SECONDS;

export const PLAYBACK_RATE_OPTIONS = [
	{ label: '0.5x', value: 0.5 },
	{ label: '0.75x', value: 0.75 },
	{ label: '1x', value: 1.0 },
	{ label: '1.25x', value: 1.25 },
	{ label: '1.5x', value: 1.5 },
	{ label: '1.75x', value: 1.75 },
	{ label: '2x', value: 2.0 },
] as const;

export const VALID_PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;
