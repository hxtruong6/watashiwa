'use client';

import React from 'react';
import { Card, Typography, Tag, Divider, Flex } from 'antd';

const { Title, Text, Paragraph } = Typography;

// Temporary interface until we import full generated types
interface VocabCardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	card: any; // We will type this properly with Prisma types later
	showAnswer: boolean;
}

export default function VocabCard({ card, showAnswer }: VocabCardProps) {
	// If no card, show loading or empty state
	if (!card || !card.vocab) return null;

	const { kanji, reading, meaning, exampleSentence, exampleMeaning, partsOfSpeech } = card.vocab;

	return (
		<div style={{ perspective: 1000, width: '100%', maxWidth: 600, margin: '0 auto' }}>
			<Card
				style={{
					width: '100%',
					minHeight: 400,
					boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
					borderRadius: 16,
					overflow: 'hidden',
					border: 'none',
					display: 'flex',
					flexDirection: 'column',
				}}
				bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
			>
				<Flex vertical align="center" justify="center" style={{ flex: 1 }}>
					{/* Front of Card (Always Visible) */}
					<Title level={1} style={{ fontSize: '64px', marginBottom: 8, color: '#1E3A5F' }}>
						{kanji}
					</Title>

					{/* Back of Card (Reveal) */}
					<div
						style={{
							opacity: showAnswer ? 1 : 0,
							transform: showAnswer ? 'translateY(0)' : 'translateY(20px)',
							transition: 'opacity 0.3s ease, transform 0.3s ease',
							width: '100%',
							textAlign: 'center',
							pointerEvents: showAnswer ? 'auto' : 'none',
						}}
					>
						{showAnswer && (
							<>
								<Divider style={{ margin: '24px 0' }} />

								<div style={{ marginBottom: 16 }}>
									<Text type="secondary" style={{ fontSize: 18 }}>
										{reading}
									</Text>
									<div style={{ marginTop: 8 }}>
										<Tag color="geekblue">{partsOfSpeech}</Tag>
									</div>
								</div>

								<Title level={3} style={{ margin: '0 0 24px' }}>
									{meaning}
								</Title>

								{exampleSentence && (
									<div
										style={{ background: '#F9F7F2', padding: 16, borderRadius: 8, width: '100%' }}
									>
										<Paragraph style={{ fontSize: 18, marginBottom: 4 }}>
											{exampleSentence}
										</Paragraph>
										<Text type="secondary" style={{ fontSize: 14 }}>
											{exampleMeaning}
										</Text>
									</div>
								)}
							</>
						)}
					</div>
				</Flex>
			</Card>
		</div>
	);
}
