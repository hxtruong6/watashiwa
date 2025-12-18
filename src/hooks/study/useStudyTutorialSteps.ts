import type { TourProps } from 'antd';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

interface UseStudyTutorialStepsParams {
	showAnswer: boolean;
	cardWrapperRef: RefObject<HTMLDivElement | null>;
	ratingBarRef: RefObject<HTMLDivElement | null>;
	settingsRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Custom hook to define tutorial steps for the Study Page.
 * Separates tutorial configuration from the main StudyContent component.
 */
export function useStudyTutorialSteps({
	showAnswer,
	cardWrapperRef,
	ratingBarRef,
	settingsRef,
}: UseStudyTutorialStepsParams): TourProps['steps'] {
	const t = useTranslations('Study.Tutorial');

	// All 4 steps defined, but step 2's Next button is disabled until answer is revealed
	const tutorialSteps: TourProps['steps'] = [
		{
			title: t('welcomeTitle'),
			description: t('welcomeDesc'),
			target: () => cardWrapperRef.current as HTMLElement,
			nextButtonProps: { children: t('next') },
		},
		{
			title: t('revealTitle'),
			description: t('revealDesc'),
			target: () => cardWrapperRef.current as HTMLElement,
			nextButtonProps: {
				children: t('next'),
				disabled: !showAnswer, // Disabled until user clicks card
			} as any, // Ant Design Tour types don't include disabled, but it works at runtime
			prevButtonProps: { children: t('previous') },
		},
		{
			title: t('ratingTitle'),
			description: t('ratingDesc'),
			target: () => ratingBarRef.current as HTMLElement,
			nextButtonProps: { children: t('next') },
			prevButtonProps: { children: t('previous') },
		},
		{
			title: t('settingsTitle'),
			description: t('settingsDesc'),
			target: () => settingsRef.current as HTMLElement,
			prevButtonProps: { children: t('previous') },
		},
	];

	return tutorialSteps;
}
