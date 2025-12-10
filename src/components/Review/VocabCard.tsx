'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Flex } from 'antd';
import type { VocabCard as VocabCardType } from '@/generated/prisma';

const { Title, Text } = Typography;

interface VocabCardProps {
	card: VocabCardType;
	onRate: (rating: number) => void;
}

export default function VocabCard({ card, onRate }: VocabCardProps) {
	const [isRevealed, setIsRevealed] = useState(false);

	// Reset state when card changes
	useEffect(() => {
		setIsRevealed(false);
	}, [card.id]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// If we are typing in an input, don't trigger (not needed for this specific component yet, but good practice)
			if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

			if (e.code === 'Space') {
				e.preventDefault();
				if (!isRevealed) setIsRevealed(true);
			} else if (isRevealed) {
				if (e.key === '1') onRate(1);
				if (e.key === '2') onRate(2);
				if (e.key === '3') onRate(3);
				if (e.key === '4') onRate(4);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isRevealed, onRate]);

	return (
		<Card
			style={{
				width: '100%',
				maxWidth: 600,
				minHeight: 400,
				margin: '0 auto',
				textAlign: 'center',
				padding: 32,
				backgroundColor: '#FFFFFF', // Clean white card on Washi background
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			}}
		>
			{/* QUESTION STATE */}
			<Flex vertical justify="center" align="center" gap={16} style={{ minHeight: 300 }}>
				{/* Word Surface (Kanji) - Make it HUGE */}
				<Title level={1} style={{ fontSize: '4rem', margin: 0 }}>
					{card.word_surface}
				</Title>

				{/* Example Sentence (Always visible in this spec? Or hint? Let's hide meaning for now to test recall) */}
				{!isRevealed && (
					<Text type="secondary" style={{ marginTop: 24 }}>
						Press [Space] to show answer
					</Text>
				)}

				{/* ANSWER STATE (Revealed) */}
				{isRevealed && (
					<div style={{ animation: 'fadeIn 0.3s ease-in' }}>
						<Title level={3} style={{ color: '#1E3A5F', margin: 0 }}>
							{card.reading_kana}
						</Title>
						<Text strong style={{ fontSize: '1.2rem', display: 'block', margin: '8px 0' }}>
							{card.han_viet}
						</Text>
						<Text style={{ fontSize: '1.2rem', display: 'block', color: '#555' }}>
							{card.meaning}
						</Text>

						<div style={{ marginTop: 40 }}>
							<Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
								Rate your recall:
							</Text>
							<Flex gap="small" justify="center">
								<button style={btnStyle('#E64A19')} onClick={() => onRate(1)}>
									1. Again
								</button>
								<button style={btnStyle('#E57373')} onClick={() => onRate(2)}>
									2. Hard
								</button>
								<button style={btnStyle('#708238')} onClick={() => onRate(3)}>
									3. Good
								</button>
								<button style={btnStyle('#4CAF50')} onClick={() => onRate(4)}>
									4. Easy
								</button>
							</Flex>
						</div>
					</div>
				)}
			</Flex>
			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</Card>
	);
}

const btnStyle = (color: string) =>
	({
		backgroundColor: 'white',
		border: `2px solid ${color}`,
		color: color,
		padding: '8px 16px',
		borderRadius: '8px',
		fontWeight: 'bold',
		cursor: 'pointer',
		fontSize: '1rem',
		transition: 'all 0.2s',
	}) as React.CSSProperties;
