'use client';

import { Select } from 'antd';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

import type { PracticeMode } from '../../hooks/usePracticeSession';

export interface PracticeSettingsProps {
	mode: PracticeMode;
	blanksPerSentence: 1 | 2;
	onModeChange: (mode: PracticeMode) => void;
	onBlanksChange: (n: 1 | 2) => void;
}

const MODE_OPTIONS: Array<{ value: PracticeMode; labelKey: string }> = [
	{ value: 'fill', labelKey: 'modeFill' },
	{ value: 'full', labelKey: 'modeFull' },
];

function PracticeSettingsComponent({
	mode,
	blanksPerSentence,
	onModeChange,
	onBlanksChange,
}: PracticeSettingsProps) {
	const t = useTranslations('Practice');

	return (
		<>
			<Select
				value={mode}
				onChange={onModeChange}
				options={MODE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
				style={{ width: 160 }}
				title={t('modeFillTooltip')}
			/>
			{mode === 'fill' && (
				<Select
					value={blanksPerSentence}
					onChange={onBlanksChange}
					options={[
						{ value: 1, label: `1 ${t('blanksPerSentence').toLowerCase()}` },
						{ value: 2, label: `2 ${t('blanksPerSentence').toLowerCase()}` },
					]}
					style={{ width: 140 }}
				/>
			)}
		</>
	);
}

export const PracticeSettings = memo(PracticeSettingsComponent);
