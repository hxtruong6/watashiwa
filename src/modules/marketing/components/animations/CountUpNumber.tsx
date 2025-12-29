/**
 * Reusable component for counting up numbers
 * Used in social proof sections
 */
'use client';

import { useCountUp } from '@/hooks/animations/useCountUp';
import { useScrollAnimation } from '@/hooks/animations/useScrollAnimation';
import React from 'react';

interface CountUpNumberProps {
	value: number;
	suffix?: string;
	prefix?: string;
	className?: string;
	style?: React.CSSProperties;
}

export default function CountUpNumber({
	value,
	suffix = '',
	prefix = '',
	className,
	style,
}: CountUpNumberProps) {
	const { ref, isVisible } = useScrollAnimation({ triggerOnce: true });
	const { count } = useCountUp(isVisible ? value : 0, { duration: 1500 });

	// Format large numbers (e.g., 1000000 -> 1M, but keep original format for display)
	const formatNumber = (num: number): string => {
		// For values >= 1M, show as "1M+" format
		if (num >= 1000000) {
			const millions = Math.floor(num / 1000000);
			return millions.toLocaleString() + 'M';
		}
		// For values >= 1K, show as "1K+" format
		if (num >= 1000) {
			const thousands = Math.floor(num / 1000);
			return thousands.toLocaleString() + 'K';
		}
		// For smaller numbers, use standard formatting
		return num.toLocaleString();
	};

	return (
		<span ref={ref as React.RefObject<HTMLSpanElement>} className={className} style={style}>
			{prefix}
			{formatNumber(count)}
			{suffix}
		</span>
	);
}
