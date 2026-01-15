/**
 * Subtitle Display Component
 *
 * Displays Japanese subtitles with word-level highlighting and romaji
 * Includes screen reader support with aria-live regions
 */
'use client';

import { Flex, Typography } from 'antd';
import { memo, useEffect, useRef } from 'react';

import type { Subtitle } from '../../types';
import { ColorLegend } from './ColorLegend';
import styles from './SubtitleDisplay.module.css';

const { Text } = Typography;

interface SubtitleDisplayProps {
	subtitle: Subtitle | null;
	activeWordIndex: number | null;
}

function SubtitleDisplay({ subtitle, activeWordIndex }: SubtitleDisplayProps) {
	const previousSubtitleRef = useRef<Subtitle | null>(null);
	const previousActiveWordRef = useRef<number | null>(null);

	// Track subtitle changes for screen reader announcements
	useEffect(() => {
		if (subtitle && subtitle !== previousSubtitleRef.current) {
			// Subtitle changed - will be announced by the aria-live region below
		}
		previousSubtitleRef.current = subtitle;
	}, [subtitle]);

	// Track active word changes for screen reader announcements
	useEffect(() => {
		if (
			subtitle &&
			activeWordIndex !== null &&
			activeWordIndex !== previousActiveWordRef.current &&
			subtitle.words[activeWordIndex]
		) {
			// Active word changed - will be announced by the aria-live region below
		}
		previousActiveWordRef.current = activeWordIndex;
	}, [subtitle, activeWordIndex]);

	if (!subtitle) {
		return (
			<div className={styles.container}>
				<Text type="secondary" style={{ fontSize: '18px' }}>
					No subtitle available
				</Text>
				{/* Screen reader announcement */}
				<div aria-live="polite" aria-atomic="true" className="sr-only">
					No subtitle available
				</div>
			</div>
		);
	}

	const activeWord = activeWordIndex !== null ? subtitle.words[activeWordIndex] : null;

	return (
		<div className={styles.container} key={subtitle.id}>
			{/* Screen reader announcements */}
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{subtitle && (
					<span>
						Subtitle: {subtitle.sentence}
						{activeWord && (
							<span>
								{' '}
								Active word: {activeWord.text}, pronounced {activeWord.romaji}
							</span>
						)}
					</span>
				)}
			</div>

			{/* Color Legend */}
			<Flex justify="flex-end" style={{ width: '100%', marginBottom: 'var(--spacing-xs)' }}>
				<ColorLegend />
			</Flex>

			<div className={styles.sentence} role="text" aria-label={`Subtitle: ${subtitle.sentence}`}>
				{subtitle.words.map((word, index) => {
					const isActive = index === activeWordIndex;
					const colorClass = word.color ? `word-${word.color}` : 'word-default';

					return (
						<span
							key={index}
							className={`${styles.word} ${styles[colorClass]} ${
								isActive ? styles.wordActive : ''
							}`}
							aria-label={
								isActive
									? `Active word: ${word.text}, pronounced ${word.romaji}`
									: `${word.text}, pronounced ${word.romaji}`
							}
							aria-current={isActive ? 'true' : undefined}
						>
							<span className={styles.wordText}>{word.text}</span>
							<span className={styles.romaji} aria-hidden="true">
								{word.romaji}
							</span>
						</span>
					);
				})}
			</div>
		</div>
	);
}

export default memo(SubtitleDisplay);
