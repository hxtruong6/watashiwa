'use client';

import type { CardBackSettings } from '@/modules/study/store/useStudyPreferences';
import { useAnimation } from 'framer-motion';
import React from 'react';

import { InterventionCard, SmartCard, StandardCard } from '../../types';
import { InterventionFace } from './Faces/InterventionFace';
import { StandardFace } from './StandardFace';

/**
 * Props passed to variant renderers
 */
export interface VariantRendererProps {
	card: SmartCard;
	side: 'front' | 'back';
	showFurigana?: boolean;
	showRomaji?: boolean;
	isPlaying?: boolean;
	onPlayAudio?: (e: React.MouseEvent) => void;
	designVariant?: 'safe' | 'aggressive' | 'minimalist';
	cardBackSettings?: CardBackSettings;
	// For INTERVENTION variant
	isFlipped?: boolean;
	onReveal?: () => void;
	controls?: ReturnType<typeof useAnimation>;
}

/**
 * Type for variant renderer functions
 */
type VariantRenderer = (props: VariantRendererProps) => React.ReactNode;

/**
 * Render BASIC variant face
 */
const renderBasicFace: VariantRenderer = ({
	card,
	side,
	showFurigana,
	showRomaji,
	isPlaying,
	onPlayAudio,
	designVariant,
	cardBackSettings,
}) => {
	return (
		<StandardFace
			card={card as StandardCard}
			side={side}
			showFurigana={showFurigana}
			showRomaji={showRomaji}
			isPlaying={isPlaying}
			onPlayAudio={onPlayAudio}
			designVariant={designVariant}
			cardBackSettings={cardBackSettings}
		/>
	);
};

/**
 * Render INTERVENTION variant face
 */
const renderInterventionFace: VariantRenderer = ({ card, side, isFlipped, onReveal, controls }) => {
	if (side !== 'front') {
		// Intervention cards only have front side (quiz mode)
		// Back side would show the answer, but this is handled differently
		return null;
	}

	return (
		<InterventionFace
			key={card.id}
			card={card as InterventionCard}
			onResolve={(isCorrect) => {
				// FAIL OPEN STRATEGY:
				// Whether correct or incorrect, we reveal the answer (Back of Card).
				// If incorrect, the user sees the correct item details immediately.
				// We do NOT trap them in a loop.
				if (!isFlipped && onReveal) {
					onReveal();
				}

				if (!isCorrect && controls) {
					// Shake animation for wrong answer
					controls.start({
						x: [0, -10, 10, -10, 10, 0],
						transition: { duration: 0.3 },
					});
				}
			}}
		/>
	);
};

/**
 * Render GAP_FILL variant face (placeholder)
 */
const renderGapFillFace: VariantRenderer = () => {
	return <div>Gap Fill Coming Soon</div>;
};

/**
 * Variant registry - factory pattern for card variant rendering
 *
 * Benefits:
 * - Easy to add new variants (just add to registry)
 * - Testable in isolation
 * - Follows Open/Closed Principle
 */
export const cardVariantRegistry: Record<string, VariantRenderer> = {
	BASIC: renderBasicFace,
	INTERVENTION: renderInterventionFace,
	GAP_FILL: renderGapFillFace,
};

/**
 * Get renderer for a card variant
 * @param variant - Card variant type
 * @returns Renderer function or default (BASIC) renderer
 */
export function getVariantRenderer(variant: string): VariantRenderer {
	return cardVariantRegistry[variant] || cardVariantRegistry.BASIC;
}
