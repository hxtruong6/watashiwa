import { useState, useEffect, useMemo } from 'react';

export type ReviewStatus = 'chill' | 'ready' | 'urgent' | 'sleep' | 'streak-rescue';

interface UseReviewStatusProps {
	nextReview: Date | null;
	urgentCard: { surface: string; meaning: string } | null;
	streak: number;
	reviewedToday: number;
}

interface ReviewStatusResult {
	status: ReviewStatus;
	timeLeftString: string;
}

export function useReviewStatus({
	nextReview,
	urgentCard,
	streak,
	reviewedToday,
}: UseReviewStatusProps): ReviewStatusResult {
	// We track "now" to trigger re-renders, but optimizations can be applied here
	// For example, if next review is hours away, we don't need to tick every minute if we only show hours/min
	const [now, setNow] = useState<Date>(new Date());

	useEffect(() => {
		// Tick every minute to update the countdown
		const interval = setInterval(() => {
			setNow(new Date());
		}, 60000); // 1 minute
		return () => clearInterval(interval);
	}, []);

	const result = useMemo(() => {
		let status: ReviewStatus = 'chill';
		let timeLeftString = '';

		const hour = now.getHours();
		const isSleepTime = hour >= 22 || hour < 5;

		// Streak Savior Logic: Late (>20h), has streak, but 0 reviews today
		const isStreakAtRisk = streak > 0 && reviewedToday === 0 && hour >= 20;

		if (isStreakAtRisk) {
			status = 'streak-rescue';
		} else if (urgentCard) {
			status = 'urgent';
		} else if (nextReview) {
			const diff = nextReview.getTime() - now.getTime();
			if (diff <= 0) {
				status = 'ready';
			} else {
				status = 'chill';
				const hours = Math.floor(diff / (1000 * 60 * 60));
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				timeLeftString = `${hours}h ${minutes}m`;
			}
		} else {
			status = isSleepTime ? 'sleep' : 'chill';
		}

		// Override chill to sleep if it's late and nothing is urgent/ready (and not rescuing streak)
		if (status === 'chill' && isSleepTime) {
			status = 'sleep';
		}

		return { status, timeLeftString };
	}, [now, nextReview, urgentCard, streak, reviewedToday]);

	return result;
}
