'use client';

import { CardShell } from '@/components/FlashCard/CardShell';
import { SessionLayout } from '@/modules/study/components/SessionLayout';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import { SmartCard } from '@/types/smart-cube';
import React, { useEffect, useState } from 'react';

// --- MOCK DATA (Until we hook up API) ---
const MOCK_CARDS: SmartCard[] = [
	{
		id: 'mock_1',
		vocabId: 'v1',
		variant: 'BASIC',
		front: {
			hero: '先生',
			sub: 'Sensei',
			audio: '', // Silent for now
		},
		back: {
			answer: 'Teacher',
			details: {
				kana: 'せんせい',
				han_viet: 'TIÊN SINH',
				meanings: ['Teacher', 'Master', 'Doctor (honorific)'],
				etymology: {
					breakdown: 'One (生) who was born before (先), thus has more wisdom.',
					han_viet: ['TIÊN', 'SINH'],
				},
			},
		},
	},
	{
		id: 'mock_2',
		vocabId: 'v2',
		variant: 'BASIC',
		front: {
			hero: '学生',
			sub: 'Gakusei',
		},
		back: {
			answer: 'Student',
			details: {
				kana: 'がくせい',
				han_viet: 'HỌC SINH',
				meanings: ['Student'],
				etymology: {
					breakdown: 'A child (生) who is learning (学).',
					han_viet: ['HỌC', 'SINH'],
				},
			},
		},
	},
	{
		id: 'mock_3',
		vocabId: 'v3',
		variant: 'BASIC',
		front: {
			hero: '学校',
			sub: 'Gakkou',
		},
		back: {
			answer: 'School',
			details: {
				kana: 'がっこう',
				han_viet: 'HỌC HIỆU',
				meanings: ['School'],
				etymology: {
					breakdown:
						'The place (交 - tree structure?) where one learns (学). *Simplify: Learning Building*.',
					han_viet: ['HỌC', 'HIỆU'],
				},
			},
		},
	},
];

export default function SessionPage() {
	const { startSession, queue, currentIndex, nextCard, submitRating, isSessionActive } =
		useSessionStore();

	// Hydration Check (Zustand persist might need this, or just safe practice)
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		// Hydration fix
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	useEffect(() => {
		// Auto-start session with mock data if empty
		if (queue.length === 0 && mounted) {
			// In real app, we might wait for API here or check if empty
			// startSession(MOCK_CARDS); // MOCK REMOVED
		}
	}, [queue.length, startSession, mounted]);

	if (!mounted) return null;

	// Calculate Progress
	const progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;

	return (
		<SessionLayout progress={progress} onExit={() => console.log('Exit requested')}>
			<div
				style={{ position: 'relative', width: '340px', height: '454px' /* 3:4 aspect typical */ }}
			>
				{isSessionActive &&
					queue.map((card, index) => {
						// Logic to show only relevant cards in stack
						// We show: Current, Next, Next+1
						if (index < currentIndex) return null; // Already passed
						if (index > currentIndex + 2) return null; // Too far ahead

						const isActive = index === currentIndex;
						const isNext = index === currentIndex + 1;

						return (
							<CardShell
								key={card.id}
								card={card}
								isActive={isActive}
								isNext={isNext}
								onSwipeRight={() => submitRating(3)} // Good
								onSwipeLeft={() => submitRating(1)} // Again
								onSwipeUp={() => submitRating(4)} // Easy
							>
								{/* Optional: Add "Next" Label or Overlay here if needed */}
							</CardShell>
						);
					})}

				{!isSessionActive && (
					<div style={{ textAlign: 'center' }}>
						<h1>Session Complete</h1>
						<p>Zen Mastery Achieved.</p>
					</div>
				)}
			</div>
		</SessionLayout>
	);
}
