'use client';

import { Alert, Button, Flex, Tooltip, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
	type FillValidationResult,
	type FullValidationResult,
	type PracticeMode,
	type ValidationResult,
	useAnswerValidation,
} from '../../hooks/useAnswerValidation';
import { usePracticeSession } from '../../hooks/usePracticeSession';
import { useSentencePlayback } from '../../hooks/useSentencePlayback';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import type { Video } from '../../types';
import { FillBlankInput } from './FillBlankInput';
import { FullSentenceInput } from './FullSentenceInput';
import { PracticeSettings } from './PracticeSettings';
import { SentencePlayer } from './SentencePlayer';
import { type FeedbackType, ValidationFeedback } from './ValidationFeedback';

interface ListenTypePracticePageProps {
	video: Video;
}

export function ListenTypePracticePage({ video }: ListenTypePracticePageProps) {
	const t = useTranslations('Practice');

	const hasSubtitles = video.subtitles && video.subtitles.length > 0;

	const [practiceMode, setPracticeMode] = useState<PracticeMode>('fill');
	const [blanksPerSentence, setBlanksPerSentence] = useState<1 | 2>(1);
	const [fillValues, setFillValues] = useState<string[]>([]);
	const [fullValue, setFullValue] = useState('');
	const [feedback, setFeedback] = useState<{
		type: FeedbackType;
		expected?: string;
		expectedPerBlank?: string[];
		incorrectBlankIndices?: number[];
	} | null>(null);

	const videoPlayer = useVideoPlayer();
	const {
		videoRef,
		play,
		pause,
		seek,
		setPlaybackRate,
		playbackRate,
		volume,
		setVolume,
		isPlaying,
	} = videoPlayer;

	const {
		currentIndex,
		currentSubtitle,
		totalSentences,
		blankIndices,
		uiState,
		setUIState,
		goNext,
		skip,
		isLastSentence,
	} = usePracticeSession({
		subtitles: video.subtitles,
		blanksPerSentence,
	});

	const { playCurrentSentence, repeatCurrentSentence } = useSentencePlayback({
		videoRef,
		seek,
		play,
		pause,
		currentSubtitle,
	});

	const { validate } = useAnswerValidation();

	const nextAutoPlayRef = useRef(false);
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
	const practiceRegionRef = useRef<HTMLDivElement>(null);

	// Reset input when sentence changes (defer setState to avoid cascading render warning)
	useEffect(() => {
		const id = setTimeout(() => {
			if (!currentSubtitle) {
				setFillValues([]);
				setFullValue('');
				setFeedback(null);
				return;
			}
			setFillValues(Array(blankIndices.length).fill(''));
			setFullValue('');
			setFeedback(null);
		}, 0);
		return () => clearTimeout(id);
	}, [currentIndex, currentSubtitle, blankIndices.length]);

	const handleSubmit = useCallback(() => {
		if (!currentSubtitle) return;
		const isFill = practiceMode === 'fill';
		if (isFill) {
			const hasAny = fillValues.some((v) => v.trim() !== '');
			if (!hasAny) {
				setFeedback({ type: 'incorrect', expected: '' });
				setTimeout(() => inputRef.current?.focus(), 0);
				return;
			}
		} else {
			if (fullValue.trim() === '') {
				setFeedback({ type: 'incorrect', expected: '' });
				setTimeout(() => inputRef.current?.focus(), 0);
				return;
			}
		}
		setUIState('checking');
		const result = validate(
			practiceMode,
			currentSubtitle,
			blankIndices,
			fillValues,
			fullValue,
		) as ValidationResult;
		const correct = 'incorrectBlankIndices' in result ? result.correct : result.correct;
		if (practiceMode === 'fill') {
			const r = result as FillValidationResult;
			setFeedback({
				type: r.correct ? 'correct' : 'incorrect',
				expectedPerBlank: r.expectedPerBlank,
				incorrectBlankIndices: r.incorrectBlankIndices,
			});
		} else {
			const r = result as FullValidationResult;
			setFeedback({
				type: r.correct ? 'correct' : 'incorrect',
				expected: r.expectedDisplay,
			});
		}
		setUIState(correct ? 'correct' : 'incorrect');
		// Move focus to practice region so Enter (Next) and P/R shortcuts work
		setTimeout(() => practiceRegionRef.current?.focus(), 0);
	}, [currentSubtitle, practiceMode, blankIndices, fillValues, fullValue, validate, setUIState]);

	const handleShowAnswer = useCallback(() => {
		if (!currentSubtitle) return;
		if (practiceMode === 'fill') {
			const expectedPerBlank = blankIndices.map((wi) => {
				const words = currentSubtitle.words;
				if (words.length === 0) return currentSubtitle.sentence;
				return words[wi]?.text ?? '';
			});
			setFeedback({
				type: 'incorrect',
				expectedPerBlank,
				incorrectBlankIndices: blankIndices.map((_, i) => i),
			});
		} else {
			setFeedback({
				type: 'incorrect',
				expected: currentSubtitle.sentence,
			});
		}
		setUIState('showAnswer');
		// Move focus to practice region so Enter (Next) and P/R shortcuts work
		setTimeout(() => practiceRegionRef.current?.focus(), 0);
	}, [currentSubtitle, practiceMode, blankIndices, setUIState]);

	const handleNext = useCallback(() => {
		if (isLastSentence) {
			return;
		}
		goNext();
	}, [isLastSentence, goNext]);

	// Right arrow: Next + auto-play after transition (run when sentence changes)
	useEffect(() => {
		if (!nextAutoPlayRef.current || !currentSubtitle) return;
		nextAutoPlayRef.current = false;
		playCurrentSentence();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only run when index/id changes for auto-play
	}, [currentIndex, currentSubtitle?.id, playCurrentSentence]);

	// Keyboard: Enter = Show answer, ArrowRight = Next + play, P = Play, R = Repeat
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isInput = target.closest('input, textarea');

			if (e.key === 'Enter') {
				// After submit/show answer: Enter = Next
				if (feedback != null && !isLastSentence) {
					e.preventDefault();
					nextAutoPlayRef.current = true;
					goNext();
					return;
				}
				// Before submit: Enter = Show answer (fill mode) or Ctrl+Enter (full mode)
				if (practiceMode === 'full') {
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						handleShowAnswer();
					}
					return;
				}
				e.preventDefault();
				handleShowAnswer();
				return;
			}

			if (e.key === 'ArrowRight' && feedback != null && !isLastSentence) {
				e.preventDefault();
				nextAutoPlayRef.current = true;
				goNext();
				return;
			}

			if (!isInput && e.key.toLowerCase() === 'p') {
				e.preventDefault();
				// Use video.paused (DOM state) instead of isPlaying - more reliable when keys pressed quickly
				const videoPlaying = videoRef.current && !videoRef.current.paused;
				if (videoPlaying) {
					pause();
				} else {
					playCurrentSentence();
				}
				return;
			}
			if (!isInput && e.key.toLowerCase() === 'r') {
				e.preventDefault();
				repeatCurrentSentence();
				return;
			}
		},
		[
			practiceMode,
			feedback,
			isLastSentence,
			goNext,
			handleShowAnswer,
			pause,
			playCurrentSentence,
			repeatCurrentSentence,
		],
	);

	if (!hasSubtitles) {
		return (
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ padding: 48, maxWidth: 560, margin: '0 auto' }}
				gap="middle"
			>
				<Alert message={t('noSubtitles')} description={t('noSubtitlesDesc')} type="info" showIcon />
				<Link href={`/learn/videos/${video.id}`}>
					<Button type="primary">{t('backToVideo')}</Button>
				</Link>
			</Flex>
		);
	}

	const canSubmit =
		practiceMode === 'fill' ? fillValues.some((v) => v.trim() !== '') : fullValue.trim() !== '';
	const isDoneWithSentence = uiState === 'correct' || uiState === 'showAnswer';
	const hasFeedback = feedback != null;

	return (
		<div
			ref={practiceRegionRef}
			tabIndex={0}
			role="region"
			aria-label="Practice"
			onKeyDown={handleKeyDown}
			style={{ outline: 'none' }}
		>
			<Flex
				vertical
				style={{
					width: '100%',
					maxWidth: 900,
					margin: '0 auto',
					padding: '24px 16px',
				}}
				gap="middle"
			>
				<Flex justify="space-between" align="center" wrap="wrap" gap="small">
					<Link href={`/learn/videos/${video.id}`}>{t('backToVideo')}</Link>
					<span style={{ flex: 1, textAlign: 'center', fontWeight: 500 }}>
						{video.titleEn || video.title}
					</span>
					<Flex gap="small">
						<PracticeSettings
							mode={practiceMode}
							blanksPerSentence={blanksPerSentence}
							onModeChange={setPracticeMode}
							onBlanksChange={setBlanksPerSentence}
						/>
					</Flex>
				</Flex>

				<SentencePlayer
					videoUrl={video.videoUrl}
					videoRef={videoRef}
					isPlaying={isPlaying}
					playbackRate={playbackRate}
					volume={volume}
					isMuted={videoPlayer.isMuted}
					playCurrentSentence={playCurrentSentence}
					repeatCurrentSentence={repeatCurrentSentence}
					play={play}
					pause={pause}
					setPlaybackRate={setPlaybackRate}
					setVolume={setVolume}
					toggleMute={videoPlayer.toggleMute}
				/>

				{/* Progress + Skip grouped */}
				<Flex justify="space-between" align="center" wrap="wrap" gap="small">
					<span
						style={{
							fontSize: 15,
							fontWeight: 600,
							color: 'var(--ant-colorText)',
						}}
					>
						{t('sentenceOf', {
							current: currentIndex + 1,
							total: totalSentences,
						})}
					</span>
					<Button size="small" onClick={skip} aria-label={t('skip')}>
						{t('skip')}
					</Button>
				</Flex>

				{practiceMode === 'fill' && currentSubtitle && (
					<FillBlankInput
						subtitle={currentSubtitle}
						blankIndices={blankIndices}
						values={fillValues}
						onChange={setFillValues}
						disabled={isDoneWithSentence}
						revealedBlanks={
							feedback?.expectedPerBlank != null ? feedback.expectedPerBlank : undefined
						}
						firstInputRef={inputRef as React.RefObject<HTMLInputElement | null>}
					/>
				)}
				{practiceMode === 'full' && (
					<FullSentenceInput
						value={fullValue}
						onChange={setFullValue}
						disabled={isDoneWithSentence}
						placeholder={t('fullSentencePlaceholder')}
						inputRef={inputRef as React.RefObject<HTMLTextAreaElement | null>}
					/>
				)}

				{/* Feedback above actions – prominent Alert */}
				{feedback && (
					<ValidationFeedback
						type={feedback.type ?? null}
						expected={feedback.expected}
						expectedPerBlank={feedback.expectedPerBlank}
						incorrectBlankIndices={feedback.incorrectBlankIndices}
					/>
				)}

				{/* After submit or show answer: only Next. Before: Submit + Show Answer. */}
				<Flex gap="small" wrap="wrap" align="center">
					{!hasFeedback ? (
						<>
							<Tooltip title={t('submitTooltip')}>
								<span>
									<Button type="primary" onClick={handleSubmit} disabled={!canSubmit}>
										{t('submit')}
									</Button>
								</span>
							</Tooltip>
							<Tooltip title={t('showAnswerTooltip')}>
								<span>
									<Button onClick={handleShowAnswer}>{t('showAnswer')}</Button>
								</span>
							</Tooltip>
						</>
					) : (
						<Button type="primary" onClick={handleNext}>
							{t('next')}
						</Button>
					)}
				</Flex>

				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					{t('shortcutsHint')}
				</Typography.Text>

				{isLastSentence && isDoneWithSentence && (
					<Alert
						message={t('practiceComplete')}
						description={t('practiceCompleteDesc')}
						type="success"
						showIcon
						action={
							<Link href={`/learn/videos/${video.id}`}>
								<Button size="small">{t('backToVideo')}</Button>
							</Link>
						}
					/>
				)}
			</Flex>
		</div>
	);
}
