/**
 * User Settings & Preferences Types
 * Aligned with Smart CUBE Architecture
 */

/**
 * User Preferences (JSONB Contract)
 * Stored in User.preferences field
 */
export interface UserPreferences {
	/** Profile Setup Completion */
	setupCompleted?: boolean; // Indicates user has completed initial profile setup

	/** Feature Discovery & Onboarding */
	tutorials?: {
		completedOnboarding?: boolean;
		sawPitchVisualizer?: boolean;
		sawInterferenceShield?: boolean;
		sawActivePriming?: boolean;
	};

	/** Accessibility */
	hapticFeedback?: boolean; // Vibration on errors
	reduceMotion?: boolean; // Disable animations

	/** Study Behavior */
	autoShowAnswer?: boolean; // Auto-reveal answer after delay
	autoShowAnswerDelay?: number; // Delay in seconds (1-300)

	/** Advanced Users (Power Users) */
	fsrsParams?: {
		requestRetention?: number; // Target retention rate (0.9 default)
		maximumInterval?: number; // Max days between reviews
	};
}

/**
 * Complete User Settings (Flattened for Forms)
 */
export interface UserSettings {
	// Daily Pacing
	limitNewCards: number;
	limitReviews: number;
	dailyGoal: number;
	enableSmartPacing: boolean;

	// Localization
	timezone: string;
	language: string;

	// Study Preferences
	autoPlayAudio: boolean;
	showPitchAccent: boolean;
	showEtymology: boolean;
	enablePriming: boolean;

	// Notifications
	enableNotifications: boolean;
	reminderTime: string | null;

	// Flexible Preferences (JSON)
	preferences: UserPreferences;
}

/**
 * Default User Preferences (for new users)
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
	tutorials: {},
	hapticFeedback: true,
	reduceMotion: false,
};

/**
 * Default User Settings (for new users)
 */
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'preferences'> = {
	limitNewCards: 10,
	limitReviews: 50,
	dailyGoal: 20,
	enableSmartPacing: true,

	timezone: 'UTC',
	language: 'en',

	autoPlayAudio: true,
	showPitchAccent: true,
	showEtymology: true,
	enablePriming: true,

	enableNotifications: true,
	reminderTime: null,
};
