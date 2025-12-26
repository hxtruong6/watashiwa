'use client';

import { useTutorialStore } from '@/hooks/useTutorialStore';
import { completeTutorial } from '@/modules/user/user.actions';
import { Tour, TourProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface AppTutorialProps {
	tutorialId: string;
	steps: TourProps['steps'];
	showAnswer?: boolean; // Track if answer is revealed
	onComplete?: () => void;
}

export default function AppTutorial({
	tutorialId,
	steps,
	showAnswer,
	onComplete,
}: AppTutorialProps) {
	const { completedTutorials, markComplete } = useTutorialStore();
	const [open, setOpen] = useState(false);
	const [current, setCurrent] = useState(0);
	const hasMounted = useRef(false);

	useEffect(() => {
		hasMounted.current = true;
	}, []);

	// Check if we should show the tutorial
	useEffect(() => {
		// Only check after hydration
		if (!hasMounted.current) return;

		if (!completedTutorials[tutorialId] && steps && steps.length > 0) {
			const timer = setTimeout(() => {
				setOpen(true);
				setCurrent(0);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [completedTutorials, tutorialId, steps]);

	const handleClose = () => {
		setOpen(false);
		setCurrent(0);
		markComplete(tutorialId);
		// Fire and forget - don't block UI
		completeTutorial(tutorialId).catch((err) => {
			console.error('Failed to save tutorial completion:', err);
		});
		if (onComplete) onComplete();
	};

	const handleChange = (newCurrent: number) => {
		setCurrent(newCurrent);
	};

	if (!steps || steps.length === 0) return null;

	return (
		<Tour
			open={open}
			current={current}
			onChange={handleChange}
			onClose={handleClose}
			onFinish={handleClose}
			steps={steps}
			mask={true}
			closable={true} // Allow closing by clicking outside
			closeIcon={true}
			type="default"
			zIndex={1000} // Lower than close button
			indicatorsRender={(current, total) => (
				<span>
					{current + 1} / {total}
				</span>
			)}
		/>
	);
}
