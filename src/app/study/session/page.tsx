'use client';

import { CardShell } from '@/modules/flashcard/components/CardShell';
import { SessionContainer } from '@/modules/flashcard/components/Session/SessionContainer';
import { SmartCard, StandardCard } from '@/modules/flashcard/types';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import React, { useEffect, useState } from 'react';

// --- MOCK DATA FOR VERTICAL SLICE VERIFICATION ---
const MOCK_CARD_1: StandardCard = {
	id: 'mock_1',
	vocabId: 'v1',
	nextReview: null,
	srsStage: 0,
	variant: 'BASIC',
	front: {
		hero: '先生',
		reading: 'せんせい',
		audio: '',
	},
	back: {
		details: {
			id: 'v1',
			deckId: 'd1',
			tags: ['n5'],
			wordSurface: '先生',
			wordReading: 'せんせい',
			wordRomaji: 'sensei',
			hanViet: 'TIÊN SINH',
			pitchPattern: 1,
			pitchSvgPath: '',
			homonymGroupId: null,
			meanings: { en: ['Teacher', 'Master'], vi: ['Giáo viên'] },
			etymology: {
				parts: [
					{ kanji: '先', han_viet: 'TIÊN', meaning: 'Before' },
					{ kanji: '生', han_viet: 'SINH', meaning: 'Life' },
				],
				note_vi: 'Người sinh ra trước thì hiểu biết hơn.',
			},
			mnemonic: { en: 'Senpai born first.', vi: 'Tiên sinh ra trước.' },
			examples: [],
			han_viet_extracted: 'TIÊN SINH', // Virtual field mock
			contentStatus: 'VERIFIED',
			verifiedAt: null,
			verifiedBy: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
			audioUrl: null,
			imageUrl: null,
		},
	},
};

const MOCK_QUEUE = [MOCK_CARD_1];

export default function SessionPage() {
	const { startSession, queue, currentIndex, submitRating, isSessionActive } = useSessionStore();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Force start session with mock data for visual verification
		if (queue.length === 0) {
			startSession(MOCK_QUEUE as any);
		}
	}, []); // eslint-disable-line

	if (!mounted) return null;

	const progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;

	return (
		<SessionContainer progress={progress} onExit={() => console.log('Exit requested')}>
			<div style={{ position: 'relative', width: '340px', aspectRatio: '3/4' }}>
				{isSessionActive ? (
					queue.map((card, index) => {
						// Logic to show only relevant cards in stack
						if (index < currentIndex) return null; // Already passed
						if (index > currentIndex + 2) return null; // Too far ahead

						const isActive = index === currentIndex;
						const isNext = index === currentIndex + 1;

						return (
							<CardShell
								key={card.id}
								card={card as any} // Temporary Cast until Store is refactored
								isActive={isActive}
								isNext={isNext}
								onSwipeRight={() => submitRating(3)}
								onSwipeLeft={() => submitRating(1)}
								onSwipeUp={() => submitRating(4)}
							/>
						);
					})
				) : (
					<div
						style={{
							color: '#999',
							textAlign: 'center',
							marginTop: '50%',
							fontFamily: 'sans-serif',
						}}
					>
						Session Complete
					</div>
				)}
			</div>
		</SessionContainer>
	);
}
