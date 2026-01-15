/**
 * StoryReader Component
 *
 * Displays story content with interactive keyword highlighting
 */

'use client';

import { trackEvent } from '@/lib/analytics';
import { markStoryRead } from '@/modules/priming/actions';
import { StoryWithContent } from '@/modules/priming/types';
import { Button, Typography } from 'antd';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { KeywordHighlight } from './KeywordHighlight';

const { Title, Paragraph } = Typography;

interface StoryReaderProps {
	story: StoryWithContent;
	onComplete: () => void;
	onSkip?: () => void;
}

export function StoryReader({ story, onComplete, onSkip }: StoryReaderProps) {
	const locale = useLocale() as 'en' | 'vi';
	const [isMarkingRead, setIsMarkingRead] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollDepth, setScrollDepth] = useState(0);
	const startTime = useRef(Date.now());

	// Track story opened
	useEffect(() => {
		trackEvent('story_opened', {
			unit_id: story.unitId,
			source: 'dashboard',
		});
	}, [story.unitId]);

	// Track scroll depth
	useEffect(() => {
		const handleScroll = () => {
			if (!scrollRef.current) return;

			const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
			const maxScroll = scrollHeight - clientHeight;

			// Prevent division by zero
			if (maxScroll <= 0) {
				setScrollDepth(0);
				return;
			}

			const depth = Math.min(100, Math.round((scrollTop / maxScroll) * 100));
			setScrollDepth(depth);
		};

		const container = scrollRef.current;
		if (container) {
			container.addEventListener('scroll', handleScroll);
			return () => container.removeEventListener('scroll', handleScroll);
		}
	}, []);

	// Get story text based on current locale
	const storyText = useMemo(() => {
		if (locale === 'vi' && story.content.translation?.vi) {
			return story.content.translation.vi;
		}
		// Use body_text for English or fallback
		return story.content.translation?.en || story.content.body_text;
	}, [locale, story.content]);

	// Parse story text with highlights
	const parsedText = useMemo(() => {
		const { highlights } = story.content;
		// For Vietnamese, we need to find Japanese words in the Vietnamese text
		// For English, use body_text with existing highlights
		const textToParse = locale === 'vi' ? storyText : story.content.body_text;

		const parts: Array<{
			type: 'text' | 'keyword';
			content: string;
			highlight?: { vocab_id: string; word_surface: string; start_index: number; length: number };
		}> = [];

		// For English: use existing highlight positions
		// For Vietnamese: find Japanese words in Vietnamese text
		if (locale === 'en') {
			// Sort highlights by start_index
			const sortedHighlights = [...highlights].sort((a, b) => a.start_index - b.start_index);
			let lastIndex = 0;

			for (const highlight of sortedHighlights) {
				// Add text before highlight
				if (highlight.start_index > lastIndex) {
					parts.push({
						type: 'text',
						content: textToParse.slice(lastIndex, highlight.start_index),
					});
				}

				// Add highlighted keyword
				parts.push({
					type: 'keyword',
					content: textToParse.slice(
						highlight.start_index,
						highlight.start_index + highlight.length,
					),
					highlight,
				});

				lastIndex = highlight.start_index + highlight.length;
			}

			// Add remaining text
			if (lastIndex < textToParse.length) {
				parts.push({
					type: 'text',
					content: textToParse.slice(lastIndex),
				});
			}
		} else {
			// For Vietnamese: find Japanese words in the text
			// Japanese words are the same, so we search for them in Vietnamese text
			const sortedHighlights = [...highlights].sort((a, b) => {
				// Find positions in Vietnamese text
				const posA = textToParse.indexOf(a.word_surface);
				const posB = textToParse.indexOf(b.word_surface);
				return posA - posB;
			});

			let lastIndex = 0;

			for (const highlight of sortedHighlights) {
				const wordPos = textToParse.indexOf(highlight.word_surface, lastIndex);
				if (wordPos === -1) {
					// Word not found, skip
					continue;
				}

				// Add text before highlight
				if (wordPos > lastIndex) {
					parts.push({
						type: 'text',
						content: textToParse.slice(lastIndex, wordPos),
					});
				}

				// Add highlighted keyword
				parts.push({
					type: 'keyword',
					content: highlight.word_surface,
					highlight,
				});

				lastIndex = wordPos + highlight.word_surface.length;
			}

			// Add remaining text
			if (lastIndex < textToParse.length) {
				parts.push({
					type: 'text',
					content: textToParse.slice(lastIndex),
				});
			}
		}

		return parts;
	}, [story.content, storyText, locale]);

	const handleMarkAsRead = useCallback(async () => {
		// Prevent race condition: ignore if already processing
		if (isMarkingRead) return;

		setIsMarkingRead(true);

		try {
			const result = await markStoryRead({ storyId: story.id });

			if (result.success) {
				const duration = Date.now() - startTime.current;

				// Track completion
				trackEvent('story_completed', {
					duration_ms: duration,
					scroll_depth_percent: scrollDepth,
					unit_id: story.unitId,
				});

				onComplete();
			} else {
				console.error('Failed to mark story as read:', result.error);
				// Still allow proceeding (optimistic UI)
				onComplete();
			}
		} catch (error) {
			console.error('Error marking story as read:', error);
			// Still allow proceeding (graceful degradation)
			onComplete();
		} finally {
			setIsMarkingRead(false);
		}
	}, [story.id, story.unitId, scrollDepth, onComplete, isMarkingRead]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				maxWidth: 800,
				margin: '0 auto',
				padding: '24px',
			}}
		>
			{/* Title */}
			<Title level={2} style={{ marginBottom: 16, textAlign: 'center' }}>
				{story.content.title[locale] || story.content.title.en || story.content.title.vi}
			</Title>

			{/* Story Content */}
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: 'auto',
					padding: '16px',
					backgroundColor: '#fafafa',
					borderRadius: 8,
					marginBottom: 24,
					fontSize: 18,
					lineHeight: 1.8,
				}}
			>
				<Paragraph style={{ marginBottom: 0, fontSize: 18 }}>
					{parsedText.map((part, index) => {
						if (part.type === 'keyword' && part.highlight) {
							return (
								<KeywordHighlight
									key={index}
									vocabId={part.highlight.vocab_id}
									wordSurface={part.highlight.word_surface}
									wordReading={part.highlight.word_surface} // TODO: Fetch actual reading from vocab
									audioUrl={null} // TODO: Fetch audio URL from vocab
								>
									{part.content}
								</KeywordHighlight>
							);
						}
						return <span key={index}>{part.content}</span>;
					})}
				</Paragraph>
			</div>

			{/* Actions */}
			<div
				style={{
					display: 'flex',
					gap: 12,
					justifyContent: 'center',
				}}
			>
				{onSkip && (
					<Button onClick={onSkip} disabled={isMarkingRead}>
						Skip to Cards
					</Button>
				)}
				<Button
					type="primary"
					size="large"
					loading={isMarkingRead}
					onClick={handleMarkAsRead}
					style={{
						minWidth: 200,
					}}
				>
					Begin Training
				</Button>
			</div>
		</div>
	);
}
