/**
 * Translation Display Component
 *
 * Displays Vietnamese translation of current subtitle
 * Improved visual hierarchy to distinguish from Japanese subtitle
 */
'use client';

import { TranslationOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { memo } from 'react';

import type { Subtitle } from '../../types';
import styles from './TranslationDisplay.module.css';

const { Paragraph } = Typography;

interface TranslationDisplayProps {
	subtitle: Subtitle | null;
}

function TranslationDisplay({ subtitle }: TranslationDisplayProps) {
	if (!subtitle || !subtitle.translation.vi) {
		return null;
	}

	return (
		<div className={styles.container} role="complementary" aria-label="Translation">
			<div className={styles.translationContent}>
				<TranslationOutlined className={styles.translationIcon} aria-hidden="true" />
				<Paragraph className={styles.translationText} aria-live="polite">
					{subtitle.translation.vi}
				</Paragraph>
			</div>
		</div>
	);
}

export default memo(TranslationDisplay);
