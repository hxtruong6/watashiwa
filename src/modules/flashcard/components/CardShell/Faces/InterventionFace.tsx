import { InterventionCard } from '@/modules/flashcard/types';
import { PlayCircleFilled } from '@ant-design/icons';
import { Card, Flex, Typography, theme } from 'antd';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const { Text, Title } = Typography;

interface InterventionFaceProps {
	card: InterventionCard;
	onResolve: (isCorrect: boolean) => void;
}

export const InterventionFace: React.FC<InterventionFaceProps> = ({ card, onResolve }) => {
	const { token } = theme.useToken();
	const { itemA, itemB, targetId, audioUrl } = card.comparison;

	// Shuffle display order so A isn't always Left
	// Fixed: Use lazy initialization to avoid synchronous setState in useEffect
	const [displayOrder] = useState<['A', 'B'] | ['B', 'A'] | null>(() =>
		Math.random() > 0.5 ? ['A', 'B'] : ['B', 'A'],
	);

	useEffect(() => {
		// Auto-play audio
		if (audioUrl) {
			const audio = new Audio(audioUrl);
			audio.play().catch((e) => console.error('Audio auto-play failed', e));
		}
	}, [audioUrl, card.id]);

	if (!displayOrder) return null;

	const handleTap = (item: typeof itemA) => {
		const isCorrect = item.id === targetId;
		onResolve(isCorrect);
	};

	const renderItem = (item: typeof itemA) => {
		return (
			<Card
				hoverable
				style={{
					flex: 1,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					border: `2px solid ${token.colorBorderSecondary}`,
					textAlign: 'center',
					background: token.colorFillAlter,
				}}
				bodyStyle={{ padding: 12 }}
				onClick={(e) => {
					e.stopPropagation(); // Prevent card flip
					handleTap(item);
				}}
			>
				{/* Image Placeholder */}
				{item.imageUrl ? (
					<div style={{ position: 'relative', width: 64, height: 64, marginBottom: 8 }}>
						<Image
							src={item.imageUrl}
							alt={item.wordSurface}
							fill
							style={{ objectFit: 'contain' }}
							sizes="64px"
						/>
					</div>
				) : (
					<div style={{ fontSize: 48, marginBottom: 8 }}>
						{/* Fallback to Kanji if no image */}
						{item.wordSurface}
					</div>
				)}

				{/* Text for differentiation if needed */}
				<Text type="secondary" style={{ fontSize: 12 }}>
					{item.hanViet || '?'}
				</Text>
			</Card>
		);
	};

	return (
		<Flex
			vertical
			style={{ width: '100%', height: '100%', padding: 16 }}
			gap="middle"
			justify="center"
		>
			{/* Header / Prompt */}
			<Flex justify="center" align="center" style={{ marginBottom: 16 }}>
				<Title level={5} style={{ margin: 0 }}>
					Which one matches?
				</Title>
				{audioUrl && (
					<PlayCircleFilled
						style={{ fontSize: 32, color: token.colorPrimary, marginLeft: 12, cursor: 'pointer' }}
						onClick={(e) => {
							e.stopPropagation();
							new Audio(audioUrl).play();
						}}
					/>
				)}
			</Flex>

			{/* Split Screen */}
			<Flex gap="middle" style={{ flex: 1, width: '100%' }}>
				{displayOrder.map((key) => (
					<React.Fragment key={key}>{renderItem(key === 'A' ? itemA : itemB)}</React.Fragment>
				))}
			</Flex>
		</Flex>
	);
};
