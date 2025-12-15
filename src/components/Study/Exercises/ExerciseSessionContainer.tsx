'use client';

import React, { useEffect, useState } from 'react';
import { App, Spin, Flex, Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import ExerciseLayout from './ExerciseLayout';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import { useExerciseSession } from '@/hooks/useExerciseSession';
import { getExerciseQuestions } from '@/services/study-actions';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';
import { CheckCircleFilled, RedoOutlined, ArrowLeftOutlined } from '@ant-design/icons';

interface ExerciseSessionContainerProps {
	deckIds: string[];
}

export default function ExerciseSessionContainer({ deckIds }: ExerciseSessionContainerProps) {
	const t = useTranslations('Study.exercises');
	const { message } = App.useApp();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	const { status, queue, currentIndex, score, startSession, submitAnswer, nextQuestion } =
		useExerciseSession();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const { playComplete } = useSoundEffects();

	useEffect(() => {
		if (status === 'summary') {
			playComplete();
			confetti({
				particleCount: 150,
				spread: 70,
				origin: { y: 0.6 },
				colors: ['#52c41a', '#1890ff', '#faad14'],
			});
		}
	}, [status, playComplete]);

	const [errorState, setErrorState] = useState<string | null>(null);

	// 1. Initial Data Fetch
	useEffect(() => {
		const init = async () => {
			setLoading(true);
			setErrorState(null);
			const result = await getExerciseQuestions(deckIds);
			if (result.success && result.data) {
				startSession(result.data);
			} else {
				if (result.error === 'NOT_ENOUGH_CARDS') {
					setErrorState('NOT_ENOUGH_CARDS');
				} else {
					message.error(result.error || t('error'));
					setErrorState('GENERIC_ERROR');
				}
			}
			setLoading(false);
		};
		init();
	}, [deckIds, startSession, message, t]);

	// 2. Handle Answer Submission
	const handleAnswer = async (answer: string) => {
		if (isSubmitting) return;
		setIsSubmitting(true);

		// Trigger Hook Logic (update score, record result)
		submitAnswer(answer);

		// Delay for visual feedback (animations)
		// 1500ms allows user to see the result (Green/Red)
		setTimeout(() => {
			nextQuestion();
			setIsSubmitting(false);
		}, 1500);
	};

	// 3. Render Loading
	if (loading) {
		return (
			<Flex justify="center" align="center" style={{ height: '100vh', background: '#f9f7f2' }}>
				<Spin size="large" tip={t('loading')} />
			</Flex>
		);
	}

	// 4. Render Error / Empty State
	if (errorState === 'NOT_ENOUGH_CARDS') {
		const isSingleDeck = deckIds.length === 1;

		return (
			<ExerciseLayout progress={0} onExit={() => router.push('/')}>
				<Flex justify="center" align="center" style={{ flex: 1 }}>
					<Result
						status="warning"
						title={t('notEnoughCards')}
						subTitle={t('notEnoughCardsDesc')}
						extra={[
							<Button key="back" onClick={() => router.back()}>
								{t('goBack')}
							</Button>,
							isSingleDeck ? (
								<Button
									key="study"
									type="primary"
									onClick={() => router.push(`/study?deckId=${deckIds[0]}`)}
								>
									{t('studyDeck')}
								</Button>
							) : (
								<Button key="browse" type="primary" onClick={() => router.push('/decks')}>
									{t('browseLibrary')}
								</Button>
							),
						]}
					/>
				</Flex>
			</ExerciseLayout>
		);
	}

	// 5. Render Generic Error
	if (errorState === 'GENERIC_ERROR') {
		return (
			<ExerciseLayout progress={0} onExit={() => router.push('/')}>
				<Flex justify="center" align="center" style={{ flex: 1 }}>
					<Result
						status="500"
						title={t('error')}
						extra={
							<Button type="primary" onClick={() => window.location.reload()}>
								{t('retry')}
							</Button>
						}
					/>
				</Flex>
			</ExerciseLayout>
		);
	}

	// 6. Render Summary
	if (status === 'summary') {
		return (
			<ExerciseLayout progress={100} onExit={() => router.push('/')}>
				<Flex justify="center" align="center" style={{ flex: 1 }}>
					<Result
						icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
						title={t('sessionComplete')}
						subTitle={t('score', { score, total: queue.length })}
						extra={[
							<Button
								key="back"
								type="default"
								icon={<ArrowLeftOutlined />}
								onClick={() => router.back()}
							>
								{t('goBack')}
							</Button>,
							<Button
								key="retry"
								type="primary"
								icon={<RedoOutlined />}
								onClick={() => window.location.reload()}
							>
								{t('playAgain')}
							</Button>,
						]}
					/>
				</Flex>
			</ExerciseLayout>
		);
	}

	// 5. Render Game
	const currentQuestion = queue[currentIndex];
	if (!currentQuestion) return null; // Should not happen if status logic matches

	const progress = Math.round((currentIndex / queue.length) * 100);

	return (
		<ExerciseLayout progress={progress} onExit={() => router.push('/')}>
			{currentQuestion.type === 'multiple_choice' && (
				<MultipleChoiceExercise
					key={currentQuestion.id} // Force re-render on new question to reset state
					question={currentQuestion}
					onAnswer={handleAnswer}
					isSubmitting={isSubmitting}
				/>
			)}
		</ExerciseLayout>
	);
}
