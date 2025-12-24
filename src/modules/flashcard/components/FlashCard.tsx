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
		const topPadding = screens.md ? 40 : screens.sm ? 24 : 16;

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

		// Data Extraction (for props)
		const isVocab = !!card?.vocab;
		const isKanji = !!card?.kanji;
		if (!isVocab && !isKanji) return null;

		const vocabData = card?.vocab || {};
		const kanjiData = card?.kanji || {};

		const frontText = isVocab ? vocabData.kanji || vocabData.wordSurface : kanjiData.kanji;
		const activeImageUrl = isVocab ? vocabData.imageUrl : kanjiData.imageUrl;
		const reading = vocabData.reading || vocabData.readingKana || '';
		const strokes = kanjiData.strokes;
		const wordParts = vocabData.wordParts;
		const romaji = vocabData.romaji;

		// Construct StandardCard object (Adapter)
		const standardCard: StandardCard = {
			id: card.id,
			vocabId: card.vocabId || card.id,
			nextReview: null,
			srsStage: 0,
			variant: 'BASIC',
			front: {
				hero: frontText,
				reading: reading,
				audio: audioUrl || '',
			},
			back: {
				details: {
					...vocabData,
					han_viet_extracted: vocabData.hanViet || '', // Map legacy hanViet to new field
				},
				// Fallback props for StandardFace directly reading from back
				// However, StandardFace reads from `back.details` AND `back.han_viet`?
				// Let's verify StandardFace implementation:
				// It uses `back.han_viet` and `back.meaning`.
				// Check where these come from in StandardCard type.
				// In StandardCard, `back` has `details: Vocabulary`.
				// And Vocabulary has `meanings`, `han_viet`, etc.
				// But wait, StandardFace accesses `back.han_viet` directly?
				// Let's re-read StandardFace line 122: `{back.han_viet && ...}`.
				// StandardCard definition in types.ts:
				// back: { details: Vocabulary; }
				// If StandardFace uses `back.han_viet`, then StandardFace is assuming `back` IS the vocabulary or has flattened fields?
				// Let's check `StandardFace.tsx` again.
				// Line 33: `const { front, back } = card;`
				// Line 122: `back.han_viet`.
				// If `back` is `{ details: Vocabulary }`, then `back.han_viet` is undefined.
				// THIS MEANS StandardFace MIGHT BE BROKEN OR TYPE DEFINITION IS WRONG AND I MISREAD IT.
				// I will construct `back` as an object containing the properties `StandardFace` expects.
				// Since I am in JS/TS, I can pass an object that satisfies the runtime usage of `StandardFace`.
			} as any,
		};
		// Adapter correction: StandardFace expects `back` to have `han_viet`, `meaning` etc. directly?
		// Re-reading StandardFace:
		// `interface StandardFaceProps { card: StandardCard; ... }`
		// `const { front, back } = card;`
		// If StandardFace uses `back.han_viet`, then `StandardCard["back"]` must have `han_viet`.
		// BUT `types.ts` said `back: { details: Vocabulary }`.
		// Checking `StandardFace.tsx` confirms it uses `back.han_viet`.
		// So `types.ts` might be out of sync with `StandardFace.tsx` OR `StandardFace.tsx` expects a flattened object.
		// For safety, I will pass a flattened object to `back`.

		const adaptedBack = {
			han_viet: isVocab ? vocabData.hanViet : kanjiData.hanViet,
			meaning: isVocab ? vocabData.meaning : kanjiData.meaning,
			usage_example: isVocab ? vocabData.exampleSentence : kanjiData.examples?.[0]?.sentence,
			// Add other fields if needed
		};
		standardCard.back = adaptedBack as any;

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
						minHeight: 400,
						boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
						borderRadius: 16,
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
					{/* Front content in fixed position */}
					<div style={{ position: 'absolute', top: topPadding, left: 0, right: 0, zIndex: 2 }}>
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
