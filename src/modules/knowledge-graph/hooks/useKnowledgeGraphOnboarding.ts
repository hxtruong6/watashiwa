'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'watashi_knowledge_graph_onboarding_seen';

/**
 * Check if user has seen the knowledge graph onboarding
 */
export function hasSeenKnowledgeGraphOnboarding(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Mark knowledge graph onboarding as seen
 */
export function markKnowledgeGraphOnboardingSeen(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, 'true');
}

/**
 * Hook to manage knowledge graph onboarding state
 */
export function useKnowledgeGraphOnboarding() {
	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		const hasSeen = hasSeenKnowledgeGraphOnboarding();
		if (!hasSeen) {
			// Small delay to ensure UI is ready
			const timer = setTimeout(() => {
				setShowOnboarding(true);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, []);

	const dismissOnboarding = () => {
		markKnowledgeGraphOnboardingSeen();
		setShowOnboarding(false);
	};

	return { showOnboarding, dismissOnboarding };
}
