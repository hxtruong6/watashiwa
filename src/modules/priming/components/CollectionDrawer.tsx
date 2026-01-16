/**
 * CollectionDrawer Component
 *
 * Sticky bottom drawer showing collected vocabulary
 * Gamified progress tracking with visual feedback
 */

'use client';

import { CheckCircleFilled, TrophyOutlined } from '@ant-design/icons';
import { Badge, Button, Progress, Space, Typography } from 'antd';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';

import { VocabMeta } from '../types';
import { prefersReducedMotion } from '../utils/animationHelpers';

const { Text } = Typography;

interface CollectionDrawerProps {
	collectedWords: VocabMeta[];
	totalWords: number;
	isExpanded: boolean;
	onToggle: () => void;
	onCompleteStory: () => void;
}

export const CollectionDrawer = forwardRef<HTMLDivElement, CollectionDrawerProps>(
	function CollectionDrawer(
		{ collectedWords, totalWords, isExpanded, onToggle, onCompleteStory },
		ref,
	) {
		const drawerRef = useRef<HTMLDivElement>(null);

		// Expose ref to parent
		useImperativeHandle(ref, () => drawerRef.current as HTMLDivElement, []);

		const [showConfetti, setShowConfetti] = useState(false);
		const percentage = totalWords > 0 ? Math.round((collectedWords.length / totalWords) * 100) : 0;
		const isComplete = collectedWords.length === totalWords && totalWords > 0;

		// Celebrate when collection is complete
		useEffect(() => {
			if (isComplete && !showConfetti) {
				// Use setTimeout to defer state update (avoids cascading renders warning)
				const showTimer = setTimeout(() => {
					setShowConfetti(true);
				}, 0);
				// Auto-hide confetti after 3 seconds
				const hideTimer = setTimeout(() => {
					setShowConfetti(false);
				}, 3000);
				return () => {
					clearTimeout(showTimer);
					clearTimeout(hideTimer);
				};
			}
		}, [isComplete, showConfetti]);

		const handleComplete = useCallback(() => {
			if (isComplete) {
				onCompleteStory();
			}
		}, [isComplete, onCompleteStory]);

		const reducedMotion = prefersReducedMotion();

		return (
			<div
				ref={drawerRef}
				data-drawer="collection"
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					backgroundColor: '#fff',
					borderTop: '2px solid rgba(108, 99, 255, 0.2)',
					boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.1)',
					zIndex: 1000,
					transition: reducedMotion ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
					transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 72px))',
				}}
			>
				{/* Confetti overlay */}
				{showConfetti && !reducedMotion && <ConfettiOverlay />}

				{/* Header (Always Visible) */}
				<div
					onClick={onToggle}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '16px 24px',
						cursor: 'pointer',
						userSelect: 'none',
					}}
				>
					<Space size={16}>
						<Badge count={collectedWords.length} showZero style={{ backgroundColor: '#6C63FF' }}>
							<TrophyOutlined style={{ fontSize: '24px', color: '#6C63FF' }} />
						</Badge>
						<div>
							<Text strong style={{ fontSize: '16px', display: 'block' }}>
								Collection Progress
							</Text>
							<Text type="secondary" style={{ fontSize: '13px' }}>
								{collectedWords.length} / {totalWords} words collected
							</Text>
						</div>
					</Space>

					<Space size={16} align="center">
						<Progress
							type="circle"
							percent={percentage}
							size={48}
							strokeColor={isComplete ? '#52c41a' : '#6C63FF'}
							format={(percent) => (
								<span
									style={{
										fontSize: '14px',
										fontWeight: 600,
										color: isComplete ? '#52c41a' : '#6C63FF',
									}}
								>
									{percent}%
								</span>
							)}
						/>

						<Button type="text" size="small">
							{isExpanded ? '▼' : '▲'}
						</Button>
					</Space>
				</div>

				{/* Expanded Content */}
				<div
					style={{
						maxHeight: isExpanded ? '300px' : '0',
						overflowY: 'auto',
						overflowX: 'hidden',
						padding: isExpanded ? '0 24px 24px' : '0',
						transition: reducedMotion ? 'none' : 'max-height 300ms ease, padding 300ms ease',
					}}
				>
					{/* Collection Grid */}
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
							gap: '12px',
							marginBottom: '16px',
						}}
					>
						{collectedWords.map((vocab, index) => (
							<div
								key={vocab.vocabularyId}
								data-word-slot={index}
								style={{
									backgroundColor: 'rgba(108, 99, 255, 0.08)',
									borderRadius: '12px',
									padding: '12px',
									textAlign: 'center',
									border: '2px solid rgba(108, 99, 255, 0.2)',
									animation: reducedMotion ? 'none' : 'word-slot-appear 300ms ease',
									animationDelay: `${index * 30}ms`,
									animationFillMode: 'backwards',
								}}
							>
								<CheckCircleFilled
									style={{ fontSize: '16px', color: '#6C63FF', marginBottom: '4px' }}
								/>
								<div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
									{vocab.wordSurface}
								</div>
								<div style={{ fontSize: '12px', color: '#666' }}>{vocab.wordReading}</div>
							</div>
						))}

						{/* Empty slots */}
						{Array.from({ length: totalWords - collectedWords.length }).map((_, i) => (
							<div
								key={`empty-${i}`}
								style={{
									backgroundColor: 'rgba(0, 0, 0, 0.02)',
									borderRadius: '12px',
									padding: '12px',
									textAlign: 'center',
									border: '2px dashed rgba(0, 0, 0, 0.1)',
									minHeight: '80px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Text type="secondary" style={{ fontSize: '12px' }}>
									Not collected yet
								</Text>
							</div>
						))}
					</div>

					{/* Complete Button */}
					{isComplete && (
						<Button
							type="primary"
							size="large"
							block
							icon={<TrophyOutlined />}
							onClick={handleComplete}
							style={{
								backgroundColor: '#52c41a',
								borderColor: '#52c41a',
								height: '56px',
								fontSize: '16px',
								fontWeight: 600,
							}}
						>
							Complete Story & Add to Flashcards
						</Button>
					)}

					{/* Animation for word slots */}
					<style jsx>{`
						@keyframes word-slot-appear {
							0% {
								opacity: 0;
								transform: scale(0.8);
							}
							100% {
								opacity: 1;
								transform: scale(1);
							}
						}
					`}</style>
				</div>
			</div>
		);
	},
);

/**
 * Generate confetti items (moved outside component to avoid linter warnings)
 */
function generateConfettiItems() {
	return Array.from({ length: 20 }, (_, i) => ({
		id: i,
		left: Math.random() * 100,
		duration: 1 + Math.random(),
		delay: Math.random() * 0.5,
		color: ['#6C63FF', '#94C973', '#FFD166', '#FF6B6B'][i % 4],
	}));
}

/**
 * Confetti Overlay Component
 * Uses useState to generate confetti positions once on mount
 */
function ConfettiOverlay() {
	// Generate confetti positions once using useState initializer function
	const [confettiItems] = useState(generateConfettiItems);

	return (
		<div
			style={{
				position: 'absolute',
				top: '-200px',
				left: 0,
				right: 0,
				height: '200px',
				pointerEvents: 'none',
				overflow: 'hidden',
			}}
		>
			{confettiItems.map((item) => (
				<div
					key={item.id}
					style={{
						position: 'absolute',
						left: `${item.left}%`,
						top: 0,
						width: '8px',
						height: '8px',
						backgroundColor: item.color,
						animation: `confetti-fall ${item.duration}s ease-in-out forwards`,
						animationDelay: `${item.delay}s`,
					}}
				/>
			))}
			<style jsx>{`
				@keyframes confetti-fall {
					0% {
						transform: translateY(0) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(200px) rotate(360deg);
						opacity: 0;
					}
				}
			`}</style>
		</div>
	);
}

/**
 * CollectionDrawer Compact (Mobile-Optimized)
 */
export function CollectionDrawerCompact({
	collectedWords,
	totalWords,
	onCompleteStory,
}: {
	collectedWords: VocabMeta[];
	totalWords: number;
	onCompleteStory: () => void;
}) {
	const isComplete = collectedWords.length === totalWords && totalWords > 0;

	return (
		<div
			style={{
				position: 'fixed',
				bottom: '16px',
				right: '16px',
				zIndex: 1000,
			}}
		>
			<Badge count={collectedWords.length} showZero>
				<Button
					type="primary"
					shape="circle"
					size="large"
					icon={<TrophyOutlined />}
					disabled={!isComplete}
					onClick={onCompleteStory}
					style={{
						width: '64px',
						height: '64px',
						boxShadow: '0 4px 16px rgba(108, 99, 255, 0.4)',
					}}
				/>
			</Badge>
		</div>
	);
}
