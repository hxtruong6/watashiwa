/**
 * Analytics Module - Public API
 *
 * This module provides a centralized, type-safe analytics system.
 *
 * @example
 * ```ts
 * import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
 *
 * // Type-safe event tracking
 * trackEvent(AnalyticsEvents.Study.SessionStarted, {
 *   entry_type: 'auto_start',
 *   queue_size: 10,
 *   due_count: 5,
 * });
 * ```
 */

// Re-export core tracking functions
export { trackEvent, identifyUser } from '../analytics';

// Re-export event constants and types
export { AnalyticsEvents, isValidEventName, getAllEventNames } from './events';
export type { AnalyticsEventName, EventProperties, AnalyticsEventPropertiesMap } from './events';

// Re-export property types for convenience
export type {
	UserSignedUpProperties,
	UserReturnedProperties,
	StudySessionStartedProperties,
	UserFirstStudySessionStartedProperties,
	StudySessionFirstCardShownProperties,
	StudySessionCompletedProperties,
	UserFirstStudySessionCompletedProperties,
	StudySessionResetProperties,
	StudyEmptyStateShownProperties,
	StudySummaryContinueClickedProperties,
	StudyNavigationTimingProperties,
	CardReviewedProperties,
	PrimingSkippedProperties,
	PrimingModalReadClickedProperties,
	PrimingModalSkipClickedProperties,
	StoryOpenedProperties,
	StoryCompletedProperties,
	KeywordTappedProperties,
	DeckCreatedProperties,
	FeatureDiscoveredProperties,
	AlgorithmModeSwitchedProperties,
	ErrorOccurredProperties,
} from './types';
