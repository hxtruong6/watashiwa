/**
 * Scroll progress indicator component
 * Shows user progress through the page
 * Used in Approach 2 (Aggressive/Persuasive)
 */
'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
	showText?: boolean;
	textTemplate?: (progress: number) => string;
}

export default function ProgressBar({
	showText = false,
	textTemplate = (progress) =>
		`You're ${Math.round(progress)}% to seeing why 10,000+ learners chose us`,
}: ProgressBarProps) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			const scrollableHeight = documentHeight - windowHeight;
			const currentProgress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

			setProgress(Math.min(100, Math.max(0, currentProgress)));
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll(); // Initial calculation

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '3px',
				background: 'rgba(0, 0, 0, 0.1)',
				zIndex: 9999,
			}}
		>
			<div
				style={{
					height: '100%',
					width: `${progress}%`,
					background: 'linear-gradient(90deg, #1E3A5F 0%, #68D391 100%)',
					transition: 'width 0.1s ease-out',
				}}
			/>
			{showText && progress > 10 && progress < 90 && (
				<div
					style={{
						position: 'absolute',
						top: '8px',
						left: '50%',
						transform: 'translateX(-50%)',
						fontSize: '12px',
						color: '#666',
						whiteSpace: 'nowrap',
					}}
				>
					{textTemplate(progress)}
				</div>
			)}
		</div>
	);
}
