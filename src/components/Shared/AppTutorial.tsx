'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Tour, TourProps } from 'antd';
import { useTutorialStore } from '@/hooks/useTutorialStore';
import { completeTutorial } from '@/services/actions';

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
		completeTutorial(tutorialId).then(() => {
			if (onComplete) onComplete();
		});
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
			indicatorsRender={(current, total) => (
				<span>
					{current + 1} / {total}
				</span>
			)}
		/>
	);
}
