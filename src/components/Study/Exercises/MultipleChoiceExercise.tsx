'use client';

import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Question } from '@/types/exercises';
import { CheckCircleFilled, CloseCircleFilled, SoundOutlined } from '@ant-design/icons';
import { Card, Col, Grid, Row, Typography, theme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

const { Title } = Typography;
const { useBreakpoint } = Grid;

interface MultipleChoiceExerciseProps {
	question: Question;
	onAnswer: (answer: string) => void;
	isSubmitting: boolean;
}

export default function MultipleChoiceExercise({
	question,
	onAnswer,
	isSubmitting,
}: MultipleChoiceExerciseProps) {
	const screens = useBreakpoint();
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isCorrectState, setIsCorrectState] = useState<boolean | null>(null);
	const { playCorrect, playIncorrect } = useSoundEffects(); // Call useSoundEffects hook

	const handleOptionClick = useCallback(
		(option: string) => {
			if (isSubmitting || selectedOption) return; // Prevent double clicks

			setSelectedOption(option);
			const isCorrect = option === question.correctAnswer;
			setIsCorrectState(isCorrect);

			// Play sound based on correctness
			if (isCorrect) {
				playCorrect();
			} else {
				playIncorrect();
			}

			onAnswer(option);
		},
		[isSubmitting, selectedOption, question.correctAnswer, onAnswer, playCorrect, playIncorrect],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isSubmitting || selectedOption) return;

			const key = e.key;
			const index = parseInt(key) - 1;

			if (!isNaN(index) && index >= 0 && index < 4 && question.options && question.options[index]) {
				handleOptionClick(question.options[index]);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSubmitting, selectedOption, question.options, handleOptionClick]);

	// Get theme tokens
	const {
		token: {
			colorBgContainer,
			colorBorderSecondary,
			colorSuccessBg,
			colorErrorBg,
			colorSuccess,
			colorError,
		},
	} = theme.useToken();

	// Audio logic
	const { speak, isPlaying } = useAudioPlayer();

	const handlePlayAudio = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			const textToSpeak = question.reading || question.challenge;

			if (question.audioUrl) {
				const audio = new Audio(question.audioUrl);
				audio.play().catch((err) => console.error('Audio play failed', err));
			} else {
				speak(textToSpeak, { rate: 0.7 }); // 0.8 is slower than default
			}
		},
		[question, speak],
	);

	return (
		<div
			style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}
		>
			{/* Question Area */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '200px',
					position: 'relative',
				}}
			>
				<div style={{ position: 'relative', display: 'inline-block' }}>
					<Title
						level={1}
						style={{
							fontSize: '64px',
							margin: 0,
							textAlign: 'center',
							position: 'relative',
							zIndex: 1,
						}}
					>
						{question.challenge}
					</Title>

					{/* Zen Audio Button - Minimal & Subtle */}
					<div
						style={{
							position: 'absolute',
							top: '50%',
							right: -48, // Place it to the right of the text
							transform: 'translateY(-50%)',
							opacity: 0.6, // Subtle by default
							transition: 'opacity 0.2s',
							cursor: 'pointer',
						}}
						onClick={handlePlayAudio}
						onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
						onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
					>
						<SoundOutlined
							style={{
								fontSize: '24px',
								color: isPlaying
									? theme.useToken().token.colorPrimary
									: theme.useToken().token.colorTextSecondary,
							}}
						/>
					</div>
				</div>
				{/* Optional: Show Reading (Furigana) if needed, or keep it hidden for hard mode? Keeping hidden for now as it is active recall of meaning. */}
			</motion.div>

			{/* Answers Grid */}
			<div style={{ flex: 1, width: '100%', maxWidth: '600px', margin: '0 auto' }}>
				<Row gutter={[screens.xs ? 8 : 16, screens.xs ? 8 : 16]}>
					<AnimatePresence mode="wait">
						{question.options?.map((option, index) => {
							const isSelected = selectedOption === option;
							// UI Polish: Use stronger border color for better dark mode visibility
							let borderColor = colorBorderSecondary;
							// Actually, user requested "easy distinct", lets use `colorBorder` or even `colorTextQuaternary` if secondary is too weak.
							// But `colorBorder` is standard. Let's try `colorBorder` + slight opacity boost if needed.
							// Or better: use `colorBorder` by default.
							borderColor = theme.useToken().token.colorBorder;

							let bgColor = colorBgContainer;
							let icon = null;

							// Feedback Logic
							if (isSelected) {
								if (isCorrectState) {
									borderColor = colorSuccess; // Green
									bgColor = colorSuccessBg;
									icon = (
										<CheckCircleFilled
											style={{
												color: colorSuccess,
												fontSize: 24,
												position: 'absolute',
												right: 10,
												top: '50%',
												transform: 'translateY(-50%)',
											}}
										/>
									);
								} else {
									borderColor = colorError; // Red
									bgColor = colorErrorBg;
									icon = (
										<CloseCircleFilled
											style={{
												color: colorError,
												fontSize: 24,
												position: 'absolute',
												right: 10,
												top: '50%',
												transform: 'translateY(-50%)',
											}}
										/>
									);
								}
							}

							// If incorrect was selected, highlight the correct one
							if (selectedOption && !isCorrectState && option === question.correctAnswer) {
								borderColor = colorSuccess;
								bgColor = colorSuccessBg;
							}

							return (
								<Col xs={24} sm={12} key={`${question.id}-${index}`}>
									<motion.div
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.1 }}
										whileHover={{ scale: !selectedOption ? 1.02 : 1 }}
										whileTap={{ scale: !selectedOption ? 0.98 : 1 }}
										style={{ height: '100%' }}
									>
										<Card
											hoverable={!selectedOption}
											onClick={() => handleOptionClick(option)}
											style={{
												height: '100%',
												display: 'flex',
												alignItems: 'center',
												userSelect: 'none',
												WebkitUserSelect: 'none',
												WebkitTouchCallout: 'none',
												justifyContent: 'center',
												textAlign: 'center',
												border: `2px solid ${borderColor}`,
												background: bgColor,
												transition: 'border-color 0.3s, background-color 0.3s',
												position: 'relative',
												cursor: selectedOption ? 'default' : 'pointer',
												borderRadius: '12px',
												boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
											}}
											styles={{
												body: {
													padding: screens.xs ? '12px' : '16px', // Reduced padding for mobile friendliness
													width: '100%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												},
											}}
										>
											<Typography.Text style={{ fontSize: '18px', fontWeight: 500 }}>
												{option}
											</Typography.Text>
											{icon}
										</Card>
									</motion.div>
								</Col>
							);
						})}
					</AnimatePresence>
				</Row>
			</div>
		</div>
	);
}
