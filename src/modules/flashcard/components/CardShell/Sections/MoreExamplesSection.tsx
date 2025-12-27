'use client';

import type { ExamplesData } from '@/lib/schemas/jsonb';
import { BookOutlined } from '@ant-design/icons';
import { Collapse, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;
const { Panel } = Collapse;

type DesignVariant = 'safe' | 'aggressive' | 'minimalist';

interface MoreExamplesSectionProps {
	examples: ExamplesData;
	firstExampleIndex: number; // Index of the first example (already shown)
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

	// Get examples beyond the first one
	const moreExamples = examples.slice(firstExampleIndex + 1);

	if (moreExamples.length === 0) {
		return null;
	}

	const activeKey = defaultExpanded ? ['more-examples'] : [];

	// Safe Variant
	if (designVariant === 'safe') {
		return (
			<Collapse ghost activeKey={activeKey} style={{ marginBottom: '16px', padding: 0 }}>
				<Panel
					header={
						<Flex gap={8} align="center">
							<BookOutlined
								style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: token.colorTextSecondary }}
							/>
							<Text
								type="secondary"
								style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 500 }}
							>
								{t('moreExamples')}
							</Text>
						</Flex>
					}
					key="more-examples"
				>
					<div style={{ paddingLeft: '24px' }}>
						{moreExamples.map((example, index) => (
							<div
								key={index}
								style={{
									marginBottom: '16px',
									padding: '12px',
									background: token.colorFillAlter,
									borderRadius: token.borderRadius,
								}}
							>
								<Text
									style={{
										fontSize: 'clamp(14px, 3.5vw, 15px)',
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
										background: token.colorBorder,
										margin: '8px 0',
									}}
								/>
								<Text
									style={{
										fontSize: 'clamp(12px, 2.8vw, 13px)',
										color: token.colorTextDescription,
										lineHeight: '1.5',
									}}
								>
									{example.translation[locale] || example.translation.en}
								</Text>
							</div>
						))}
					</div>
				</Panel>
			</Collapse>
		);
	}

	// Aggressive Variant
	if (designVariant === 'aggressive') {
		return (
			<Collapse ghost activeKey={activeKey} style={{ marginBottom: '16px', padding: 0 }}>
				<Panel
					header={
						<Flex gap={8} align="center">
							<Text style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>💬</Text>
							<Text
								type="secondary"
								style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 600 }}
							>
								{t('seeMoreUsage')}
							</Text>
						</Flex>
					}
					key="more-examples"
				>
					<div style={{ paddingLeft: '24px' }}>
						{moreExamples.map((example, index) => (
							<div
								key={index}
								style={{
									marginBottom: '20px',
									padding: '16px 20px',
									background: token.colorFillAlter,
									borderRadius: '16px 16px 16px 4px',
									position: 'relative',
								}}
							>
								<Text
									style={{
										fontSize: 'clamp(16px, 4vw, 18px)',
										color: token.colorText,
										lineHeight: '1.6',
										display: 'block',
										marginBottom: '10px',
										fontWeight: 500,
									}}
								>
									{example.sentence}
								</Text>
								<Text
									style={{
										fontSize: 'clamp(13px, 3vw, 14px)',
										color: token.colorTextDescription,
										lineHeight: '1.5',
									}}
								>
									{example.translation[locale] || example.translation.en}
								</Text>
							</div>
						))}
					</div>
				</Panel>
			</Collapse>
		);
	}

	// Minimalist Variant
	return (
		<Collapse ghost activeKey={activeKey} style={{ marginBottom: '24px', padding: 0 }}>
			<Panel
				header={
					<Text
						type="secondary"
						style={{ fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 400, letterSpacing: '0.02em' }}
					>
						{t('moreExamples')}
					</Text>
				}
				key="more-examples"
			>
				<div style={{ paddingLeft: '20px' }}>
					{moreExamples.map((example, index) => (
						<div key={index} style={{ marginBottom: '24px' }}>
							<Text
								style={{
									fontSize: 'clamp(14px, 3.5vw, 16px)',
									color: token.colorText,
									lineHeight: '1.7',
									display: 'block',
									marginBottom: '8px',
									fontWeight: 400,
								}}
							>
								{example.sentence}
							</Text>
							<Text
								style={{
									fontSize: 'clamp(13px, 3vw, 14px)',
									color: token.colorTextDescription,
									lineHeight: '1.6',
								}}
							>
								{example.translation[locale] || example.translation.en}
							</Text>
						</div>
					))}
				</div>
			</Panel>
		</Collapse>
	);
};
