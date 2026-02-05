/**
 * Centralized Analytics Event Definitions
 *
 * This file provides a single source of truth for all analytics event names.
 * Following best practices:
 * - Namespaced by domain (auth, study, priming, etc.)
 * - Type-safe event properties
 * - Easy to discover and maintain
 * - Prevents typos and inconsistencies
 *
 * Usage:
 *   import { AnalyticsEvents } from '@/lib/analytics/events';
 *   trackEvent(AnalyticsEvents.Study.SessionStarted, { ... });
 */
import type {
	AlgorithmModeSwitchedProperties,
	CardReviewedProperties,
	DeckCreatedProperties,
	ErrorOccurredProperties,
	FeatureDiscoveredProperties,
	KeywordTappedProperties,
	PrimingModalReadClickedProperties,
	PrimingModalSkipClickedProperties,
	PrimingSkippedProperties,
	StoryCompletedProperties,
	StoryOpenedProperties,
	StudyBriefingSkippedProperties,
	StudyEmptyStateShownProperties,
	StudyNavigationTimingProperties,
	StudySessionCompletedProperties,
	StudySessionFirstCardShownProperties,
	StudySessionResetProperties,
	StudySessionStartedProperties,
	StudySummaryContinueClickedProperties,
	UserFirstStudySessionCompletedProperties,
	UserFirstStudySessionStartedProperties,
	UserReturnedProperties,
	UserSignedUpProperties,
} from './types';

/**
 * Event name constants organized by domain
 * Follows snake_case convention: [domain]_[object]_[action]
 */
export const AnalyticsEvents = {
	// ========================================================================
	// AUTHENTICATION & USER EVENTS
	// ========================================================================
	Auth: {
		UserSignedUp: 'user_signed_up',
		UserReturned: 'user_returned',
	} as const,

	// ========================================================================
	// STUDY SESSION EVENTS
	// ========================================================================
	Study: {
		// Session lifecycle
		SessionStarted: 'study_session_started',
		FirstSessionStarted: 'user_first_study_session_started',
		FirstCardShown: 'study_session_first_card_shown',
		SessionCompleted: 'study_session_completed',
		FirstSessionCompleted: 'user_first_study_session_completed',
		SessionReset: 'study_session_reset',
		EmptyStateShown: 'study_empty_state_shown',

		// Session interactions
		CardReviewed: 'card_reviewed',
		SummaryContinueClicked: 'study_summary_continue_clicked',
		NavigationTiming: 'study_navigation_timing',
		BriefingSkipped: 'study_briefing_skipped',
	} as const,

	// ========================================================================
	// PRIMING EVENTS
	// ========================================================================
	Priming: {
		Skipped: 'priming_skipped',
		ModalReadClicked: 'priming_modal_read_clicked',
		ModalSkipClicked: 'priming_modal_skip_clicked',
		StoryOpened: 'story_opened',
		StoryCompleted: 'story_completed',
		KeywordTapped: 'keyword_tapped',
	} as const,

	// ========================================================================
	// DECK EVENTS
	// ========================================================================
	Deck: {
		Created: 'deck_created',
		// Future events can be added here:
		// Updated: 'deck_updated',
		// Deleted: 'deck_deleted',
		// Shared: 'deck_shared',
	} as const,

	// ========================================================================
	// FEATURE DISCOVERY EVENTS
	// ========================================================================
	Feature: {
		Discovered: 'feature_discovered',
	} as const,

	// ========================================================================
	// ALGORITHM EVENTS
	// ========================================================================
	Algorithm: {
		ModeSwitched: 'algorithm_mode_switched',
	} as const,

	// ========================================================================
	// ERROR & SYSTEM EVENTS
	// ========================================================================
	Error: {
		Occurred: 'error_occurred',
	} as const,
} as const;

/**
 * Type-safe event name type
 * Extracts all event names from the AnalyticsEvents object
 */
export type AnalyticsEventName =
	| (typeof AnalyticsEvents.Auth)[keyof typeof AnalyticsEvents.Auth]
	| (typeof AnalyticsEvents.Study)[keyof typeof AnalyticsEvents.Study]
	| (typeof AnalyticsEvents.Priming)[keyof typeof AnalyticsEvents.Priming]
	| (typeof AnalyticsEvents.Deck)[keyof typeof AnalyticsEvents.Deck]
	| (typeof AnalyticsEvents.Feature)[keyof typeof AnalyticsEvents.Feature]
	| (typeof AnalyticsEvents.Algorithm)[keyof typeof AnalyticsEvents.Algorithm]
	| (typeof AnalyticsEvents.Error)[keyof typeof AnalyticsEvents.Error];

/**
 * Type-safe event properties mapping
 * Maps event names to their corresponding property types
 */
export interface AnalyticsEventPropertiesMap {
	[AnalyticsEvents.Auth.UserSignedUp]: UserSignedUpProperties;
	[AnalyticsEvents.Auth.UserReturned]: UserReturnedProperties;
	[AnalyticsEvents.Study.SessionStarted]: StudySessionStartedProperties;
	[AnalyticsEvents.Study.FirstSessionStarted]: UserFirstStudySessionStartedProperties;
	[AnalyticsEvents.Study.FirstCardShown]: StudySessionFirstCardShownProperties;
	[AnalyticsEvents.Study.SessionCompleted]: StudySessionCompletedProperties;
	[AnalyticsEvents.Study.FirstSessionCompleted]: UserFirstStudySessionCompletedProperties;
	[AnalyticsEvents.Study.SessionReset]: StudySessionResetProperties;
	[AnalyticsEvents.Study.EmptyStateShown]: StudyEmptyStateShownProperties;
	[AnalyticsEvents.Study.SummaryContinueClicked]: StudySummaryContinueClickedProperties;
	[AnalyticsEvents.Study.NavigationTiming]: StudyNavigationTimingProperties;
	[AnalyticsEvents.Study.CardReviewed]: CardReviewedProperties;
	[AnalyticsEvents.Study.BriefingSkipped]: StudyBriefingSkippedProperties;
	[AnalyticsEvents.Priming.Skipped]: PrimingSkippedProperties;
	[AnalyticsEvents.Priming.ModalReadClicked]: PrimingModalReadClickedProperties;
	[AnalyticsEvents.Priming.ModalSkipClicked]: PrimingModalSkipClickedProperties;
	[AnalyticsEvents.Priming.StoryOpened]: StoryOpenedProperties;
	[AnalyticsEvents.Priming.StoryCompleted]: StoryCompletedProperties;
	[AnalyticsEvents.Priming.KeywordTapped]: KeywordTappedProperties;
	[AnalyticsEvents.Deck.Created]: DeckCreatedProperties;
	[AnalyticsEvents.Feature.Discovered]: FeatureDiscoveredProperties;
	[AnalyticsEvents.Algorithm.ModeSwitched]: AlgorithmModeSwitchedProperties;
	[AnalyticsEvents.Error.Occurred]: ErrorOccurredProperties;
}

/**
 * Helper type to extract properties for a specific event
 */
export type EventProperties<T extends AnalyticsEventName> =
	T extends keyof AnalyticsEventPropertiesMap
		? AnalyticsEventPropertiesMap[T]
		: Record<string, unknown>;

/**
 * Validate event name exists in our system
 * Useful for runtime validation or migration tools
 */
export function isValidEventName(eventName: string): eventName is AnalyticsEventName {
	const allEvents = [
		...Object.values(AnalyticsEvents.Auth),
		...Object.values(AnalyticsEvents.Study),
		...Object.values(AnalyticsEvents.Priming),
		...Object.values(AnalyticsEvents.Deck),
		...Object.values(AnalyticsEvents.Feature),
		...Object.values(AnalyticsEvents.Algorithm),
		...Object.values(AnalyticsEvents.Error),
	];
	return allEvents.includes(eventName as AnalyticsEventName);
}

/**
 * Get all event names (useful for debugging, documentation, or migration)
 */
export function getAllEventNames(): AnalyticsEventName[] {
	return [
		...Object.values(AnalyticsEvents.Auth),
		...Object.values(AnalyticsEvents.Study),
		...Object.values(AnalyticsEvents.Priming),
		...Object.values(AnalyticsEvents.Deck),
		...Object.values(AnalyticsEvents.Feature),
		...Object.values(AnalyticsEvents.Algorithm),
		...Object.values(AnalyticsEvents.Error),
	];
}
