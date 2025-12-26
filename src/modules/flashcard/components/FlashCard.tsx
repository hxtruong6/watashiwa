'use client';

import { useFlashCardAudio } from '@/hooks/study/useFlashCardAudio';
import { StandardFace } from '@/modules/flashcard/components/CardShell/StandardFace';
import { StandardCard } from '@/modules/flashcard/types';
import { Card as AntCard, Grid } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

const { useBreakpoint } = Grid;

interface FlashCardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	card: any;
	showAnswer: boolean;
	showFurigana?: boolean;
	showRomaji?: boolean;
	autoPlayAudio?: 'off' | 'question' | 'answer';
	onReveal?: () => void;
}

export interface FlashCardHandle {
	playAudio: () => void;
	playExampleAudio: () => void;
}

const FlashCard = forwardRef<FlashCardHandle, FlashCardProps>(
	(
		{ card, showAnswer, showFurigana = true, showRomaji = false, autoPlayAudio = 'off', onReveal },
		ref,
	) => {
		const screens = useBreakpoint();
		const [imageError, setImageError] = useState(false);

		// Responsive padding: smaller on mobile, larger on desktop
		const topPadding = screens.md ? 40 : screens.sm ? 24 : 20; // Slightly increased for mobile breathability

		// Audio Hook
		const {
			audioRef,
			isPlaying,
			playAudio,
			playExampleAudio,
			toggleAudio,
			setIsFilePlaying,
			audioUrl,
		} = useFlashCardAudio({ card, showAnswer, autoPlayAudio });

		// Expose methods to parent
		useImperativeHandle(ref, () => ({
			playAudio,
			playExampleAudio,
		}));

		if (!card) return null;

		// Check if card is already a SmartCard (has front/back structure)
		const isSmartCard = !!(card as any)?.front && !!(card as any)?.back;

		// Debug logging
		if (isSmartCard) {
			console.log('[FlashCard] Detected SmartCard structure:', {
				hasFront: !!(card as any)?.front,
				hasBack: !!(card as any)?.back,
				frontHero: (card as any)?.front?.hero,
				hasDetails: !!(card as any)?.back?.details,
			});
		}

		// Data Extraction (for props)
		const isVocab = !!card?.vocab;
		const isKanji = !!card?.kanji;

		// If it's a SmartCard, use it directly; otherwise check for vocab/kanji
		if (!isSmartCard && !isVocab && !isKanji) return null;

		// If SmartCard, extract from front/back structure
		let vocabData: any = {};
		let kanjiData: any = {};
		let frontText = '';

		if (isSmartCard) {
			// SmartCard structure: card.front.hero, card.back.details
			const smartCard = card as any;
			const backDetails = smartCard.back?.details || {};
			// Create new object instead of mutating
			vocabData = {
				...backDetails,
				wordSurface: smartCard.front?.hero || backDetails.wordSurface || backDetails.kanji || '',
				wordReading: smartCard.front?.reading || backDetails.wordReading,
				audioUrl: smartCard.front?.audio || backDetails.audioUrl,
			};
			frontText = vocabData.wordSurface;
		} else {
			vocabData = card?.vocab || {};
			kanjiData = card?.kanji || {};
			frontText = isVocab ? vocabData.kanji || vocabData.wordSurface : kanjiData.kanji;
		}

		// Adapter correction:
		// StandardFace expects `back.details` to be a Vocabulary object.
		// We need to map the flat properties from `vocabData` or `kanjiData` into this structure.

		const rawMeaning =
			isVocab || isSmartCard ? vocabData.meanings || vocabData.meaning : kanjiData.meaning;
		let meaningsAdapter: { en: string[]; vi: string[] } = { en: [], vi: [] };

		// Robust Meaning Extraction
		if (typeof rawMeaning === 'string') {
			// If string, try to parse JSON if it looks like it, otherwise default to EN
			try {
				const parsed = JSON.parse(rawMeaning);
				meaningsAdapter = parsed;
			} catch {
				meaningsAdapter = { en: [rawMeaning], vi: [] };
			}
		} else if (rawMeaning && typeof rawMeaning === 'object') {
			if (!Array.isArray(rawMeaning)) {
				meaningsAdapter = rawMeaning;
			}
		}

		// Robust Reading Extraction (Prisma V2 uses wordReading)
		const reading = vocabData.wordReading || vocabData.reading || vocabData.readingKana || '';

		const examplesAdapter =
			(isVocab || isSmartCard ? vocabData.examples : kanjiData.examples) || [];

		// Construct StandardCard object (Adapter)
		// If already a SmartCard, use it directly (with minor adaptations)
		let standardCard: StandardCard;

		if (isSmartCard) {
			const smartCard = card as any;
			standardCard = {
				id: smartCard.id,
				vocabId: smartCard.vocabId || smartCard.id,
				nextReview: smartCard.nextReview || null,
				srsStage: smartCard.srsStage ?? 0,
				variant: smartCard.variant || 'BASIC',
				front: {
					hero: smartCard.front?.hero || frontText,
					reading: smartCard.front?.reading || reading,
					audio: smartCard.front?.audio || audioUrl || (frontText ? 'tts' : ''),
				},
				back: {
					details: smartCard.back?.details || vocabData,
				},
			};
		} else {
			standardCard = {
				id: card.id,
				vocabId: card.vocabId || card.id,
				nextReview: null,
				srsStage: 0,
				variant: 'BASIC',
				front: {
					hero: frontText,
					reading: reading,
					// If no file URL, but we have text, we signal 'tts' so the button appears.
					// The hook knows to use speak() when audioUrl is empty.
					audio: audioUrl || (frontText ? 'tts' : ''),
				},
				back: {
					details: {
						...vocabData,
						hanViet: isVocab || isSmartCard ? vocabData.hanViet : kanjiData.hanViet,
						meanings: meaningsAdapter,
						// Fallback for missing fields in partial data
						etymology: vocabData.etymology || {},
						examples: examplesAdapter,
					} as any,
				},
			};
		}

		return (
			<div
				onClickCapture={() => {
					if (!showAnswer && onReveal) {
						onReveal();
					}
				}}
				style={{
					perspective: 1000,
					width: '100%',
					maxWidth: 600,
					margin: '0 auto',
					cursor: !showAnswer ? 'pointer' : 'default',
					userSelect: 'none',
					WebkitUserSelect: 'none',
				}}
			>
				{/* Hidden Audio Element */}
				{audioUrl && (
					<audio
						ref={audioRef}
						src={audioUrl}
						preload="none"
						onEnded={() => setIsFilePlaying(false)}
						onPause={() => setIsFilePlaying(false)}
						onPlay={() => setIsFilePlaying(true)}
						onLoadStart={() => setIsFilePlaying(false)}
					/>
				)}

				<AntCard
					style={{
						width: '100%',
						height: '65vh', // Viewport-relative height (Zen Mode)
						maxHeight: 600,
						minHeight: 320,
						boxShadow: '0 8px 32px -4px rgba(0,0,0,0.08)', // Soft, deep shadow
						borderRadius: 24, // Rounder corners (Storyteller)
						overflow: 'hidden',
						border: 'none',
						display: 'flex',
						flexDirection: 'column',
						position: 'relative',
						transition: 'transform 0.1s ease',
					}}
					onMouseDown={(e) => {
						if (!showAnswer) e.currentTarget.style.transform = 'scale(0.98)';
					}}
					onMouseUp={(e) => {
						if (!showAnswer) e.currentTarget.style.transform = 'scale(1)';
					}}
					onMouseLeave={(e) => {
						if (!showAnswer) e.currentTarget.style.transform = 'scale(1)';
					}}
					styles={{
						body: {
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							padding: 0, // Remove default padding for full control
							position: 'relative',
						},
					}}
				>
					{/* Front content: Absolute positioning to overlay back content location, but centered vertically */}
					<div
						style={{
							position: 'absolute',
							top: topPadding, // Start after padding
							left: 0,
							right: 0,
							bottom: 0, // Stretch to bottom
							zIndex: 2,
							display: 'flex', // Ensure flex context for child
							flexDirection: 'column',
						}}
					>
						<StandardFace
							side="front"
							card={standardCard}
							showFurigana={showFurigana}
							showRomaji={showRomaji}
							isPlaying={isPlaying}
							onPlayAudio={() => toggleAudio()}
						/>
					</div>

					{/* Back content flows below, doesn't affect front positioning */}
					<div
						style={{
							paddingTop: screens.md ? 200 : screens.sm ? 180 : 160,
							position: 'relative',
							zIndex: 1,
							opacity: showAnswer ? 1 : 0, // Hide back when not revealed
							transition: 'opacity 0.2s ease',
						}}
					>
						<StandardFace side="back" card={standardCard} />
					</div>
				</AntCard>
			</div>
		);
	},
);

FlashCard.displayName = 'FlashCard';

export default FlashCard;
