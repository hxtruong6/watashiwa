import { SmartCard } from '@/types/smart-cube';
import { CheckCircleFilled, CloseCircleFilled, SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

const { Title, Text } = Typography;

interface InterventionFaceProps {
	card: SmartCard;
	side: 'front' | 'back'; // Intervention is usually "Modal" but fits in shell
	onPlayAudio?: () => void;
}

export const InterventionFace: React.FC<InterventionFaceProps> = ({ card, side, onPlayAudio }) => {
	const { token } = theme.useToken();
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const options = card.back.intervention?.options || [];

	const handleOptionClick = (optionId: string, correct: boolean) => {
		setSelectedOption(optionId);
		setIsCorrect(correct);
		if (correct) {
			// Trigger success sound/effect
		} else {
			// Trigger shake/fail
		}
	};

	// Intervention is special: It's "Always Front" until solved, then maybe "Back" is summary?
	// For this implementation, we handle the interaction entirely on the "Front" view
	// or assume the shell lets us interact.
	// Wait: CardShell flips on tap. Intervention shouldn't flip on tap until resolved.
	// NOTE: This requires CardShell to know if it should flip.
	// For Phase 1, we'll put the quiz on the "Front" and the "Resolution" on the "Back".

	if (side === 'front') {
		return (
			<Flex
				vertical
				align="center"
				justify="space-between"
				style={{ height: '100%', padding: '24px 16px' }}
			>
				{/* Header */}
				<Flex vertical align="center" gap="small">
					<div
						style={{ background: token.colorErrorBg, padding: '4px 12px', borderRadius: '12px' }}
					>
						<Text type="danger" strong>
							Confusing Pair
						</Text>
					</div>
					<Title level={4} style={{ textAlign: 'center', margin: 0 }}>
						Which one matches the sound?
					</Title>
					<Button
						type="primary"
						shape="circle"
						icon={<SoundOutlined />}
						size="large"
						onClick={(e) => {
							e.stopPropagation();
							onPlayAudio?.();
						}}
					/>
				</Flex>

				{/* Options */}
				<Flex vertical gap="middle" style={{ width: '100%' }}>
					{options.map((opt) => {
						const isSelected = selectedOption === opt.id;
						const statusColor = isSelected
							? opt.isCorrect
								? token.colorSuccess
								: token.colorError
							: token.colorFillSecondary;

						return (
							<motion.div key={opt.id} whileTap={{ scale: 0.98 }}>
								<Button
									block
									size="large"
									onClick={(e) => {
										e.stopPropagation(); // Prevent Flip
										handleOptionClick(opt.id, opt.isCorrect);
									}}
									style={{
										height: 'auto',
										padding: '16px',
										borderColor: isSelected ? statusColor : undefined,
										background: isSelected ? undefined : 'transparent',
									}}
								>
									<Flex align="center" justify="space-between" style={{ width: '100%' }}>
										<Text style={{ fontSize: '18px', fontWeight: 500 }}>{opt.label}</Text>
										{isSelected &&
											(opt.isCorrect ? (
												<CheckCircleFilled
													style={{ color: token.colorSuccess, fontSize: '20px' }}
												/>
											) : (
												<CloseCircleFilled style={{ color: token.colorError, fontSize: '20px' }} />
											))}
									</Flex>
								</Button>
							</motion.div>
						);
					})}
				</Flex>

				<div style={{ minHeight: '40px' }}>
					{isCorrect && (
						<Text type="success" strong>
							Tap card to see details →
						</Text>
					)}
					{isCorrect === false && <Text type="danger">Not quite. Listen again!</Text>}
				</div>
			</Flex>
		);
	}

	// BACK: Summary Details
	return (
		<Flex vertical style={{ height: '100%', padding: '32px' }}>
			<Title level={3} style={{ color: token.colorSuccess }}>
				Solved!
			</Title>
			<Text>
				The difference is in the <strong>Pitch Accent</strong>.
			</Text>
			{/* Simple details summary */}
			<div style={{ marginTop: '24px' }}>
				<Title level={1}>{card.front.hero}</Title>
				<Text type="secondary">{card.back.details.kana}</Text>
			</div>
		</Flex>
	);
};
