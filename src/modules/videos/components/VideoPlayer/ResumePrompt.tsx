/**
 * Resume Prompt Component
 *
 * Modal that asks user if they want to resume from last position
 */
'use client';

import { Button, Modal } from 'antd';
import { memo, useCallback } from 'react';

interface ResumePromptProps {
	open: boolean;
	currentTime: number;
	duration: number;
	onResume: () => void;
	onStartFromBeginning: () => void;
	onDontAskAgain?: () => void;
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
	if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function ResumePromptComponent({
	open,
	currentTime,
	duration,
	onResume,
	onStartFromBeginning,
	onDontAskAgain,
}: ResumePromptProps) {
	const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

	const handleResume = useCallback(() => {
		onResume();
	}, [onResume]);

	const handleStartFromBeginning = useCallback(() => {
		onStartFromBeginning();
	}, [onStartFromBeginning]);

	const handleDontAskAgain = useCallback(() => {
		onDontAskAgain?.();
		onResume(); // Also resume when "don't ask again" is clicked
	}, [onDontAskAgain, onResume]);

	return (
		<Modal
			open={open}
			title="Resume from Last Position?"
			onCancel={handleStartFromBeginning}
			footer={[
				<Button key="beginning" onClick={handleStartFromBeginning}>
					Start from Beginning
				</Button>,
				onDontAskAgain && (
					<Button key="dont-ask" type="text" onClick={handleDontAskAgain}>
						Don&apos;t Ask Again
					</Button>
				),
				<Button key="resume" type="primary" onClick={handleResume}>
					Resume from {formatTime(currentTime)}
				</Button>,
			].filter(Boolean)}
			centered
			closable={false}
			aria-labelledby="resume-prompt-title"
			aria-describedby="resume-prompt-description"
		>
			<div id="resume-prompt-description">
				<p>
					You were watching this video at <strong>{formatTime(currentTime)}</strong> (
					{progressPercent}% complete).
				</p>
				<p>Would you like to continue from where you left off?</p>
			</div>
		</Modal>
	);
}

export const ResumePrompt = memo(ResumePromptComponent);
