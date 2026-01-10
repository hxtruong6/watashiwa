'use client';

import type { ExamplesData } from '@/lib/schemas/jsonb';
import { CollapsibleSection } from '@/modules/shared/components/CollapsibleSection';
import { BookOutlined } from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;

type DesignVariant = 'safe' | 'aggressive' | 'minimalist';

interface MoreExamplesSectionProps {
	examples: ExamplesData;
	firstExampleIndex: number;
	designVariant: DesignVariant;
	defaultExpanded: boolean;
	locale?: 'vi' | 'en';
}

export const MoreExamplesSection: React.FC<MoreExamplesSectionProps> = ({
	examples,
	firstExampleIndex,
	designVariant,
	defaultExpanded,
	locale = 'vi',
}) => {
	const { token } = theme.useToken();
	const t = useTranslations('Study.cardBack');

	const moreExamples = examples.slice(firstExampleIndex + 1);

	if (moreExamples.length === 0) {
		return null;
	}

	// Dynamic title based on variant (optional, but nice to keep)
	const title = designVariant === 'aggressive' ? t('seeMoreUsage') : t('moreExamples');

	// Icon can be customized too, but sticking to standard for consistency
	const icon = <BookOutlined style={{ color: token.colorTextSecondary }} />;

	return (
		<CollapsibleSection title={title} icon={icon} defaultExpanded={defaultExpanded}>
			<Flex vertical gap={16}>
				{moreExamples.map((example, index) => (
					<div
						key={index}
						style={{
							padding: '12px',
							background: 'rgba(0,0,0,0.02)', // Very subtle inner background
							borderRadius: token.borderRadius,
							border: `1px solid ${token.colorBorderSecondary}`,
						}}
					>
						<Text
							style={{
								fontSize: '15px',
								color: token.colorText,
								lineHeight: '1.6',
								display: 'block',
								marginBottom: '8px',
							}}
						>
							{example.sentence}
						</Text>
						<div
							style={{
								height: '1px',
								background: token.colorBorderSecondary,
								margin: '8px 0',
							}}
						/>
						<Text
							style={{
								fontSize: '13px',
								color: token.colorTextDescription,
							}}
						>
							{example.translation[locale] || example.translation.en}
						</Text>
					</div>
				))}
			</Flex>
		</CollapsibleSection>
	);
};
