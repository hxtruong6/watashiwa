'use client';

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

export type FeedbackType = 'correct' | 'incorrect' | null;

export interface ValidationFeedbackProps {
	type: FeedbackType;
	expected?: string;
	expectedPerBlank?: string[];
	incorrectBlankIndices?: number[];
}

function ValidationFeedbackComponent({
	type,
	expected,
	expectedPerBlank = [],
	incorrectBlankIndices = [],
}: ValidationFeedbackProps) {
	const t = useTranslations('Practice');

	if (type === null) return null;

	if (type === 'correct') {
		return (
			<Alert
				type="success"
				showIcon
				icon={<CheckCircleOutlined />}
				message={t('correct')}
				role="status"
				aria-live="polite"
			/>
		);
	}

	const perBlank =
		incorrectBlankIndices.length > 0 && expectedPerBlank.length > 0
			? incorrectBlankIndices.map((i) => expectedPerBlank[i]).filter(Boolean)
			: expected != null && expected !== ''
				? [expected]
				: [];
	const expectedStr = perBlank.length > 0 ? perBlank.join(', ') : (expected ?? '');
	const isEmptyError = expected === '' && perBlank.length === 0;
	const message = isEmptyError ? t('pleaseEnterAnswer') : t('incorrect', { expected: expectedStr });

	return (
		<Alert
			type="error"
			showIcon
			icon={<CloseCircleOutlined />}
			message={message}
			role="status"
			aria-live="polite"
		/>
	);
}

export const ValidationFeedback = memo(ValidationFeedbackComponent);
