'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Card as AntCard, Grid } from 'antd';

const { useBreakpoint } = Grid;
import { useFlashCardAudio } from '@/hooks/study/useFlashCardAudio';
import FlashCardFront from '@/components/Study/FlashCardFront';
import FlashCardBack from '@/components/Study/FlashCardBack';

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
		const reading = vocabData.reading;
		const strokes = kanjiData.strokes;
		const wordParts = vocabData.wordParts;
		const romaji = vocabData.romaji;

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
						<FlashCardFront
							isVocab={isVocab}
							frontText={frontText}
							reading={reading}
							strokes={strokes}
							wordParts={wordParts}
							romaji={romaji}
							showFurigana={showFurigana}
							showRomaji={showRomaji}
							isPlaying={isPlaying}
							onToggleAudio={toggleAudio}
						/>
					</div>

					{/* Back content flows below, doesn't affect front positioning */}
					<div
						style={{
							paddingTop: screens.md ? 200 : screens.sm ? 180 : 160,
							position: 'relative',
							zIndex: 1,
						}}
					>
						<FlashCardBack
							card={card}
							showAnswer={showAnswer}
							activeImageUrl={activeImageUrl}
							imageError={imageError}
							setImageError={setImageError}
							playExampleAudio={playExampleAudio}
							frontText={frontText}
						/>
					</div>
				</AntCard>
			</div>
		);
	},
);

FlashCard.displayName = 'FlashCard';

export default FlashCard;
