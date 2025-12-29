/**
 * Reusable component for fade-in on scroll animations
 * Respects prefers-reduced-motion
 */
'use client';

import { useScrollAnimation } from '@/hooks/animations/useScrollAnimation';
import React from 'react';

interface FadeInOnScrollProps {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
	style?: React.CSSProperties;
}

export default function FadeInOnScroll({
	children,
	delay = 0,
	duration = 0.6,
	className,
	style,
}: FadeInOnScrollProps) {
	const { ref, isVisible } = useScrollAnimation({ triggerOnce: true });

	return (
		<div
			ref={ref as React.RefObject<HTMLDivElement>}
			className={className}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
				transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
				...style,
			}}
		>
			{children}
		</div>
	);
}
