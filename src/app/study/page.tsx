'use client';

import { useState, useEffect } from 'react';
import { getNextReviewCard, submitReview } from '@/services/actions';
import type { StudyCardWithVocab } from '@/services/actions';
import VocabCard from '@/components/review/VocabCard';
import { Spin, Result, Button } from 'antd';

export default function StudyPage() {
	const [currentCard, setCurrentCard] = useState<StudyCardWithVocab | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadNextCard = async () => {
		setLoading(true);
		try {
			const card = await getNextReviewCard();
			setCurrentCard(card);
			setError('');
		} catch (err) {
			console.error(err);
			setError('Failed to load card');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadNextCard();
	}, []);

	const handleRate = async (rating: number) => {
		if (!currentCard) return;

		try {
			const result = await submitReview(currentCard.id, rating);
			if (result.success) {
				// Move to next card
				if (result.nextCard) {
					setCurrentCard(result.nextCard);
				} else {
					// If no next card returned immediately, fetch again
					await loadNextCard();
				}
			} else {
				alert('Error submitting review: ' + result.error);
			}
		} catch (err) {
			console.error(err);
			alert('Failed to submit review');
		}
	};

	if (loading && !currentCard) {
		return (
			<div style={centerStyle}>
				<Spin size="large" tip="Loading your deck..." />
			</div>
		);
	}

	if (!currentCard) {
		return (
			<div style={centerStyle}>
				<Result
					status="success"
					title="You're all done!"
					subTitle="No more cards due for review right now. Great job!"
					extra={[
						<Button type="primary" key="home" href="/">
							Go Home
						</Button>,
						<Button key="check" onClick={loadNextCard}>
							Check Again
						</Button>,
					]}
				/>
			</div>
		);
	}

	return (
		<div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#F9F7F2' }}>
			<VocabCard card={currentCard} onRate={handleRate} />
		</div>
	);
}

const centerStyle = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	height: '100vh',
	backgroundColor: '#F9F7F2',
};
