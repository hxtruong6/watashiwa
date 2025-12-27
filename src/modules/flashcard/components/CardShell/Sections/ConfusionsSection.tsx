'use client';

import type { ConfusionExplanation } from '@/lib/schemas/jsonb';
import { getConfusionsForVocab } from '@/modules/vocabulary/vocabulary.actions';
import { WarningOutlined } from '@ant-design/icons';
import { Collapse, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;
const { Panel } = Collapse;

type DesignVariant = 'safe' | 'aggressive' | 'minimalist';

interface ConfusionItem {
	word: string;
	explanation: ConfusionExplanation;
	type?: string;
}

interface ConfusionsSectionProps {
	vocabId: string;
	confusions?: ConfusionItem[]; // Optional: if already in card data
	designVariant: DesignVariant;
	defaultExpanded: boolean;
	locale?: 'vi' | 'en';
}

export const ConfusionsSection: React.FC<ConfusionsSectionProps> = ({
	vocabId,
	confusions: initialConfusions,
	designVariant,
	defaultExpanded,
	locale = 'vi',
}) => {
	const { token } = theme.useToken();
	const t = useTranslations('Study.cardBack');
	const [confusions, setConfusions] = useState<ConfusionItem[]>(initialConfusions || []);
	const [loading, setLoading] = useState(() => !initialConfusions);

	// Fetch confusions if not provided
	useEffect(() => {
		if (!initialConfusions && vocabId && loading) {
			getConfusionsForVocab({ vocabId })
				.then((result) => {
					if (result.success && result.data) {
						setConfusions(result.data);
					}
				})
				.catch(() => {
					// Silently fail - section just won't show
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [vocabId, initialConfusions, loading]);

	if (loading || confusions.length === 0) {
		return null;
	}

	const activeKey = defaultExpanded ? ['confusions'] : [];

	// Safe Variant
	if (designVariant === 'safe') {
		return (
			<Collapse ghost activeKey={activeKey} style={{ marginBottom: '16px', padding: 0 }}>
				<Panel
					header={
						<Flex gap={8} align="center">
							<WarningOutlined
								style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: token.colorWarning }}
							/>
							<Text
								type="secondary"
								style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 500 }}
							>
								{t('similarWords')}
							</Text>
						</Flex>
					}
					key="confusions"
				>
					<div style={{ paddingLeft: '24px' }}>
						{confusions.map((confusion, index) => (
							<div
								key={index}
								style={{
									marginBottom: '16px',
									padding: '16px',
									background: token.colorWarningBg,
									borderRadius: token.borderRadius,
									border: `1px solid ${token.colorWarningBorder}`,
								}}
							>
								<Text
									strong
									style={{
										fontSize: 'clamp(14px, 3.5vw, 16px)',
										color: token.colorTextHeading,
										display: 'block',
										marginBottom: '12px',
									}}
								>
									{confusion.word}
								</Text>
								{confusion.explanation.mnemonic && (
									<div style={{ marginBottom: '12px' }}>
										<Text
											style={{
												fontSize: '14px',
												color: token.colorText,
												lineHeight: '1.5',
											}}
										>
											{confusion.explanation.mnemonic[locale] || confusion.explanation.mnemonic.en}
										</Text>
									</div>
								)}
								<div
									style={{
										height: '1px',
										background: token.colorBorder,
										margin: '12px 0',
									}}
								/>
								<Flex vertical gap={8}>
									<div>
										<Text
											type="secondary"
											style={{
												fontSize: 'clamp(10px, 2.2vw, 11px)',
												fontWeight: 500,
												display: 'block',
												marginBottom: '4px',
											}}
										>
											{t('thisWord')}
										</Text>
										<Text
											style={{
												fontSize: 'clamp(12px, 2.8vw, 13px)',
												color: token.colorText,
												lineHeight: '1.5',
											}}
										>
											{confusion.explanation.item1_nuance[locale] ||
												confusion.explanation.item1_nuance.en}
										</Text>
									</div>
									<div>
										<Text
											type="secondary"
											style={{
												fontSize: 'clamp(10px, 2.2vw, 11px)',
												fontWeight: 500,
												display: 'block',
												marginBottom: '4px',
											}}
										>
											{confusion.word}:
										</Text>
										<Text
											style={{
												fontSize: 'clamp(12px, 2.8vw, 13px)',
												color: token.colorText,
												lineHeight: '1.5',
											}}
										>
											{confusion.explanation.item2_nuance[locale] ||
												confusion.explanation.item2_nuance.en}
										</Text>
									</div>
								</Flex>
							</div>
						))}
					</div>
				</Panel>
			</Collapse>
		);
	}

	// Aggressive Variant - Always visible if exists (not collapsible)
	if (designVariant === 'aggressive') {
		return (
			<div style={{ marginBottom: '20px' }}>
				<Flex gap={8} align="center" style={{ marginBottom: '16px' }}>
					<Text style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>⚠️</Text>
					<Text type="secondary" style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 600 }}>
						{t('dontConfuseWith')}
					</Text>
				</Flex>
				<div>
					{confusions.map((confusion, index) => (
						<div
							key={index}
							style={{
								marginBottom: '16px',
								padding: '16px 20px',
								background: `${token.colorWarning}15`,
								borderRadius: token.borderRadius,
								border: `1px solid ${token.colorWarningBorder}`,
							}}
						>
							<Text
								strong
								style={{
									fontSize: 'clamp(16px, 4vw, 18px)',
									color: token.colorTextHeading,
									display: 'block',
									marginBottom: '12px',
									fontWeight: 700,
								}}
							>
								{confusion.word}
							</Text>
							{confusion.explanation.mnemonic && (
								<div style={{ marginBottom: '12px' }}>
									<Text
										style={{
											fontSize: 'clamp(14px, 3.5vw, 15px)',
											color: token.colorText,
											lineHeight: '1.6',
											fontWeight: 500,
										}}
									>
										{confusion.explanation.mnemonic[locale] || confusion.explanation.mnemonic.en}
									</Text>
								</div>
							)}
							<Flex vertical gap={10} style={{ marginTop: '12px' }}>
								<div>
									<Text
										type="secondary"
										style={{
											fontSize: 'clamp(11px, 2.5vw, 12px)',
											fontWeight: 600,
											display: 'block',
											marginBottom: '6px',
										}}
									>
										{t('thisWord')}
									</Text>
									<Text
										style={{
											fontSize: 'clamp(13px, 3vw, 14px)',
											color: token.colorText,
											lineHeight: '1.5',
											fontWeight: 500,
										}}
									>
										{confusion.explanation.item1_nuance[locale] ||
											confusion.explanation.item1_nuance.en}
									</Text>
								</div>
								<div>
									<Text
										type="secondary"
										style={{
											fontSize: 'clamp(11px, 2.5vw, 12px)',
											fontWeight: 600,
											display: 'block',
											marginBottom: '6px',
										}}
									>
										{confusion.word}:
									</Text>
									<Text
										style={{
											fontSize: 'clamp(13px, 3vw, 14px)',
											color: token.colorText,
											lineHeight: '1.5',
											fontWeight: 500,
										}}
									>
										{confusion.explanation.item2_nuance[locale] ||
											confusion.explanation.item2_nuance.en}
									</Text>
								</div>
							</Flex>
						</div>
					))}
				</div>
			</div>
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
						{t('similar')}
					</Text>
				}
				key="confusions"
			>
				<div style={{ paddingLeft: '20px' }}>
					{confusions.map((confusion, index) => (
						<div
							key={index}
							style={{
								marginBottom: '20px',
								paddingBottom: '20px',
								borderBottom:
									index < confusions.length - 1 ? `1px solid ${token.colorBorder}` : 'none',
								opacity: 0.8,
							}}
						>
							<Text
								style={{
									fontSize: 'clamp(14px, 3.5vw, 15px)',
									color: token.colorTextHeading,
									display: 'block',
									marginBottom: '8px',
									fontWeight: 500,
								}}
							>
								{confusion.word}
							</Text>
							{confusion.explanation.mnemonic && (
								<Text
									style={{
										fontSize: 'clamp(12px, 2.8vw, 13px)',
										color: token.colorTextDescription,
										lineHeight: '1.6',
										display: 'block',
										marginBottom: '12px',
									}}
								>
									{confusion.explanation.mnemonic[locale] || confusion.explanation.mnemonic.en}
								</Text>
							)}
							<Flex vertical gap={6}>
								<Text
									style={{
										fontSize: 'clamp(11px, 2.5vw, 12px)',
										color: token.colorTextDescription,
										lineHeight: '1.5',
									}}
								>
									{confusion.explanation.item1_nuance[locale] ||
										confusion.explanation.item1_nuance.en}
								</Text>
								<Text
									style={{
										fontSize: 'clamp(11px, 2.5vw, 12px)',
										color: token.colorTextDescription,
										lineHeight: '1.5',
									}}
								>
									{confusion.explanation.item2_nuance[locale] ||
										confusion.explanation.item2_nuance.en}
								</Text>
							</Flex>
						</div>
					))}
				</div>
			</Panel>
		</Collapse>
	);
};
