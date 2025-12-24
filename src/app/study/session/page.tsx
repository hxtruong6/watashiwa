'use client';

import { CardShell } from '@/modules/flashcard/components/CardShell';
import { SessionContainer } from '@/modules/flashcard/components/Session/SessionContainer';
import { fetchSessionAction } from '@/modules/flashcard/flashcard.actions';
import { useSessionStore } from '@/modules/flashcard/store/useSessionStore';
import React, { useEffect, useState } from 'react';

export default function SessionPage() {
	const { startSession, queue, currentIndex, submitRating, isSessionActive } = useSessionStore();

	const [mounted, setMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Initialize Session with Real Data
	useEffect(() => {
		async function init() {
			if (queue.length > 0) {
				setIsLoading(false);
				return;
			}

			try {
				const cards = await fetchSessionAction('unit1');
				if (cards && cards.length > 0) {
					startSession(cards);
				}
			} catch (error) {
				console.error('Failed to load session:', error);
			} finally {
				setIsLoading(false);
			}
		}

		if (mounted) {
			init();
		}
	}, [mounted, queue.length, startSession]);

	if (!mounted) return null;

	// Simple Loading State for now
	if (isLoading) {
		return (
			<SessionContainer progress={0} onExit={() => {}}>
				<div style={{ color: '#aaa', textAlign: 'center', marginTop: '40vh' }}>Loading...</div>
			</SessionContainer>
		);
	}

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
								card={card}
								isActive={isActive}
								isNext={isNext}
								showFurigana={true} // Default for now
								onSwipeRight={() => submitRating(3)}
								onSwipeLeft={() => submitRating(1)}
								onSwipeUp={() => submitRating(4)}
							/>
						);
					})
				) : (
					<div
						style={{
							color: '#666',
							textAlign: 'center',
							marginTop: '50%',
							fontFamily: 'sans-serif',
						}}
					>
						<h3>Session Complete</h3>
						<p>Great job!</p>
					</div>
				)}
			</div>
		</SessionContainer>
	);
}
