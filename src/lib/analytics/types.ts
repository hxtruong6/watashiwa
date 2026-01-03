/**
 * Type-safe analytics event properties
 * Each event category has its own property interface
 */

// ============================================================================
// AUTHENTICATION EVENTS
// ============================================================================

export interface UserSignedUpProperties {
	user_id: string;
	method: 'email' | 'oauth' | 'google';
	source: string;
	timestamp?: string;
}

export interface UserReturnedProperties {
	days_since_last_visit: number;
	total_visits: number;
	streak_days?: number;
	last_study_date?: string | null;
}

// ============================================================================
// STUDY SESSION EVENTS
// ============================================================================

export interface StudySessionStartedProperties {
	entry_type: 'explicit_deck' | 'explicit_course' | 'auto_start';
	deck_id?: string | null;
	course_id?: string | null;
	mode?: string | null;
	queue_size: number;
	due_count: number;
	device_memory?: number;
	hardware_concurrency?: number;
	connection_type?: string;
	is_pwa?: boolean;
}

export interface UserFirstStudySessionStartedProperties {
	entry_method: 'explicit_deck' | 'explicit_course' | 'auto_start';
	deck_id?: string | null;
	queue_size: number;
	due_count: number;
}

export interface StudySessionFirstCardShownProperties {
	time_to_first_card_ms: number;
	entry_type: 'explicit_deck' | 'explicit_course' | 'auto_start';
}

export interface StudySessionCompletedProperties {
	cards_reviewed: number;
	cards_new?: number;
	cards_reviewed_again?: number;
	cards_mastered?: number;
	session_duration_ms?: number;
}

export interface UserFirstStudySessionCompletedProperties {
	cards_reviewed: number;
	session_duration_ms: number;
}

export interface StudySessionResetProperties {
	reason: 'empty_queue' | 'summary_navigation' | 'manual' | 'error';
	deck_id?: string | null;
	navigation_path?: string;
}

export interface StudyEmptyStateShownProperties {
	deck_id?: string | null;
	course_id?: string | null;
	total_due_count?: number;
}

export interface StudySummaryContinueClickedProperties {
	has_more_cards: boolean;
	navigation_path: string;
}

export interface StudyNavigationTimingProperties {
	duration_ms: number;
	navigation_path: string;
}

export interface CardReviewedProperties {
	rating: number;
	card_type?: string;
	card_id?: string;
	deck_id?: string;
	course_id?: string;
}

// ============================================================================
// PRIMING EVENTS
// ============================================================================

export interface PrimingSkippedProperties {
	unit_id?: string;
	source?: 'modal' | 'session';
}

export interface PrimingModalReadClickedProperties {
	unit_id: string;
}

export interface PrimingModalSkipClickedProperties {
	unit_id: string;
}

export interface StoryOpenedProperties {
	unit_id: string;
	source: string;
}

export interface StoryCompletedProperties {
	duration_ms: number;
	scroll_depth_percent: number;
	unit_id?: string;
}

export interface KeywordTappedProperties {
	word_id: string;
	word_text: string;
	word_reading?: string;
	unit_id?: string;
}

// ============================================================================
// DECK EVENTS
// ============================================================================

export interface DeckCreatedProperties {
	method: 'manual' | 'import' | 'template';
	is_first_deck?: boolean;
	deck_id?: string;
}

// ============================================================================
// FEATURE DISCOVERY EVENTS
// ============================================================================

export interface FeatureDiscoveredProperties {
	feature_name: string;
	days_since_signup: number;
	discovery_method: 'navigation' | 'tutorial' | 'suggestion';
}

// ============================================================================
// ALGORITHM EVENTS
// ============================================================================

export interface AlgorithmModeSwitchedProperties {
	from_mode: string;
	to_mode: string;
}

// ============================================================================
// ERROR EVENTS
// ============================================================================

export interface ErrorOccurredProperties {
	error_type: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	error_message?: string;
	error_stack?: string;
	context?: Record<string, unknown>;
}

// ============================================================================
// UNION TYPE FOR ALL EVENT PROPERTIES
// ============================================================================

export type AnalyticsEventProperties =
	| UserSignedUpProperties
	| UserReturnedProperties
	| StudySessionStartedProperties
	| UserFirstStudySessionStartedProperties
	| StudySessionFirstCardShownProperties
	| StudySessionCompletedProperties
	| UserFirstStudySessionCompletedProperties
	| StudySessionResetProperties
	| StudyEmptyStateShownProperties
	| StudySummaryContinueClickedProperties
	| StudyNavigationTimingProperties
	| CardReviewedProperties
	| PrimingSkippedProperties
	| PrimingModalReadClickedProperties
	| PrimingModalSkipClickedProperties
	| StoryOpenedProperties
	| StoryCompletedProperties
	| KeywordTappedProperties
	| DeckCreatedProperties
	| FeatureDiscoveredProperties
	| AlgorithmModeSwitchedProperties
	| ErrorOccurredProperties
	| Record<string, unknown>; // Fallback for unknown events
