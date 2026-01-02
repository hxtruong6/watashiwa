import { z } from 'zod';

/**
 * Zod Schemas for User Settings
 * Used for Server Action validation
 */

/**
 * User Preferences Schema (JSONB Contract)
 */
export const UserPreferencesSchema = z.object({
	setupCompleted: z.boolean().optional(), // Indicates user has completed initial profile setup
	tutorials: z
		.object({
			completedOnboarding: z.boolean().optional(),
			sawPitchVisualizer: z.boolean().optional(),
			sawInterferenceShield: z.boolean().optional(),
			sawActivePriming: z.boolean().optional(),
		})
		.optional(),
	hapticFeedback: z.boolean().optional(),
	reduceMotion: z.boolean().optional(),
	autoShowAnswer: z.boolean().optional(),
	autoShowAnswerDelay: z.number().int().min(1).max(300).optional(),
	fsrsParams: z
		.object({
			requestRetention: z.number().min(0.5).max(1).optional(),
			maximumInterval: z.number().min(1).max(730).optional(),
		})
		.optional(),
	algorithmMode: z.enum(['semantic', 'srs']).optional(),
});

/**
 * Update User Settings Schema
 * For PATCH /api/user/settings
 */
export const UpdateUserSettingsSchema = z.object({
	// Daily Pacing
	limitNewCards: z.number().int().min(1).max(100).optional(),
	limitReviews: z.number().int().min(1).max(1000).optional(),
	dailyGoal: z.number().int().min(1).max(500).optional(),
	enableSmartPacing: z.boolean().optional(),

	// Localization
	timezone: z.string().optional(),
	language: z.enum(['en', 'vi', 'ja']).optional(),

	// Study Preferences
	autoPlayAudio: z.boolean().optional(),
	showPitchAccent: z.boolean().optional(),
	showEtymology: z.boolean().optional(),
	enablePriming: z.boolean().optional(),

	// Notifications
	enableNotifications: z.boolean().optional(),
	reminderTime: z
		.string()
		.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM format')
		.nullable()
		.optional(),

	// Preferences (JSONB)
	preferences: UserPreferencesSchema.optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsSchema>;
