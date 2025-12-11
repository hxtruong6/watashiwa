'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Flex, Result, Spin, App } from 'antd';
import { getNextReviewCard, submitReview } from '@/services/actions';
import VocabCard from '@/components/VocabCard';
import RatingBar from '@/components/RatingBar';
import { LoadingOutlined, CheckCircleFilled, CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Content } = Layout;

export default function StudyPage() {
	const [card, setCard] = useState<any>(null); // Type will be fixed with Prisma generation
	const [loading, setLoading] = useState(true);
	const [showAnswer, setShowAnswer] = useState(false);
	const [sessionComplete, setSessionComplete] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// Access global message context
	const { message } = App.useApp();
	const router = useRouter();

	// Fetch Initial Card
	const fetchNextCard = useCallback(async () => {
		try {
			setLoading(true);
			const nextCard = await getNextReviewCard();
			if (nextCard) {
				setCard(nextCard);
				setShowAnswer(false);
				setSessionComplete(false);
			} else {
				setCard(null);
				setSessionComplete(true);
			}
		} catch (error) {
			console.error('Failed to fetch card', error);
			message.error('Failed to load cards. Please try refreshing.');
		} finally {
			setLoading(false);
		}
	}, [message]);

	useEffect(() => {
		fetchNextCard();
	}, [fetchNextCard]);

	// Handle Rating Submission
	const handleRate = useCallback(
		async (rating: number) => {
			if (!card || submitting) return;

			try {
				setSubmitting(true);
				const result = await submitReview(card.id, rating);

				if (result.success) {
					// Optimistic update or wait for new card
					if (result.nextCard) {
						setCard(result.nextCard);
						setShowAnswer(false);
					} else {
						setCard(null);
						setSessionComplete(true);
					}
				} else {
					message.error(result.error || 'Failed to submit review');
				}
			} catch (error) {
				console.error('Review error', error);
				message.error('An unexpected error occurred.');
			} finally {
				setSubmitting(false);
			}
		},
		[card, submitting, message],
	);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (loading || submitting || sessionComplete) return;

			if (e.code === 'Space') {
				e.preventDefault();
				if (!showAnswer) {
					setShowAnswer(true);
				}
			} else if (showAnswer) {
				switch (e.key) {
					case '1':
						handleRate(1);
						break;
					case '2':
						handleRate(2);
						break;
					case '3':
						handleRate(3);
						break;
					case '4':
						handleRate(4);
						break;
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [card, showAnswer, loading, submitting, sessionComplete, handleRate]); // Add deps!

	// Loading State
	if (loading && !card) {
		return (
			<Flex justify="center" align="center" style={{ height: '100vh', background: '#F9F7F2' }}>
				<Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1E3A5F' }} spin />} />
			</Flex>
		);
	}

	// Session Complete State
	if (sessionComplete) {
		return (
			<Flex justify="center" align="center" style={{ height: '100vh', background: '#F9F7F2' }}>
				<Result
					icon={<CheckCircleFilled style={{ color: '#708238', fontSize: 72 }} />}
					title="Session Complete!"
					subTitle="You've reviewed all your due cards for now. Great work!"
					extra={[
						<Button type="primary" key="home" size="large" onClick={() => router.push('/')}>
							Return to Dashboard
						</Button>,
					]}
				/>
			</Flex>
		);
	}

	return (
		<Layout style={{ minHeight: '100vh', background: '#F9F7F2' }}>
			{/* Exit Button - Top Right */}
			<div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
				<Button
					shape="circle"
					icon={<CloseOutlined />}
					onClick={() => router.push('/')}
					style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
				/>
			</div>

			<Content
				style={{
					padding: '16px',
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
					maxWidth: 600,
					margin: '0 auto',
					width: '100%',
				}}
			>
				{/* Scrollable Card Area */}
				<div
					style={{
						flex: 1,
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
						paddingBottom: 100,
					}}
				>
					<VocabCard card={card} showAnswer={showAnswer} />
				</div>

				{/* Thumb Zone Controls - Fixed Bottom */}
				<div
					style={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						padding: '16px 24px 32px',
						background: 'linear-gradient(to top, #F9F7F2 80%, rgba(249, 247, 242, 0))',
						display: 'flex',
						justifyContent: 'center',
						zIndex: 50,
					}}
				>
					{!showAnswer ? (
						<Button
							size="large"
							type="primary"
							block
							style={{
								height: 56,
								fontSize: 18,
								borderRadius: 28,
								maxWidth: 400,
								boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
							}}
							onClick={() => setShowAnswer(true)}
						>
							Show Answer
						</Button>
					) : (
						<RatingBar onRate={handleRate} disabled={submitting} />
					)}
				</div>
			</Content>
		</Layout>
	);
}
