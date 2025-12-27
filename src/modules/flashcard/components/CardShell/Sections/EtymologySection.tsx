'use client';

import type { EtymologyData } from '@/lib/schemas/jsonb';
import { HistoryOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Collapse, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;
const { Panel } = Collapse;

type DesignVariant = 'safe' | 'aggressive' | 'minimalist';

interface EtymologySectionProps {
	etymology: EtymologyData | null;
	designVariant: DesignVariant;
	defaultExpanded: boolean;
	locale?: 'vi' | 'en';
}

export const EtymologySection: React.FC<EtymologySectionProps> = ({
	etymology,
	designVariant,
	defaultExpanded,
	locale = 'vi',
}) => {
	const { token } = theme.useToken();
	const t = useTranslations('Study.cardBack');

	if (!etymology || !etymology.parts || etymology.parts.length === 0) {
		return null;
	}

	const activeKey = defaultExpanded ? ['etymology'] : [];

	// Safe Variant
	if (designVariant === 'safe') {
		return (
			<div onClick={(e) => e.stopPropagation()}>
				<Collapse ghost activeKey={activeKey} style={{ marginBottom: '16px', padding: 0 }}>
					<Panel
						header={
							<Flex gap={8} align="center">
								<HistoryOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
								<Text
									type="secondary"
									style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 500 }}
								>
									{t('etymology')}
								</Text>
							</Flex>
						}
						key="etymology"
					>
						<div style={{ paddingLeft: '24px' }}>
							{etymology.parts.map((part, index) => (
								<div key={index} style={{ marginBottom: '16px' }}>
									<Flex gap={8} align="center" style={{ marginBottom: '8px' }}>
										<Text
											strong
											style={{
												fontSize: 'clamp(16px, 4vw, 18px)',
												color: token.colorTextHeading,
											}}
										>
											{part.kanji}
										</Text>
										<Text
											style={{
												fontSize: 'clamp(11px, 2.5vw, 12px)',
												color: token.colorPrimary,
												background: token.colorPrimaryBg,
												padding: '2px 8px',
												borderRadius: '4px',
											}}
										>
											{part.han_viet}
										</Text>
									</Flex>
									<Text
										style={{
											fontSize: 'clamp(13px, 3vw, 14px)',
											color: token.colorText,
											lineHeight: '1.5',
										}}
									>
										{part.meaning[locale] || part.meaning.en}
									</Text>
								</div>
							))}
							{etymology.note && (
								<div
									style={{
										marginTop: '16px',
										padding: '12px',
										background: token.colorFillAlter,
										borderRadius: token.borderRadius,
									}}
								>
									<Flex gap={8} align="center" style={{ marginBottom: '8px' }}>
										<InfoCircleOutlined style={{ fontSize: 14, color: token.colorTextSecondary }} />
										<Text
											type="secondary"
											style={{ fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 500 }}
										>
											{t('note')}
										</Text>
									</Flex>
									<Text
										style={{
											fontSize: '13px',
											color: token.colorText,
											lineHeight: '1.5',
										}}
									>
										{etymology.note[locale] || etymology.note.en}
									</Text>
								</div>
							)}
						</div>
					</Panel>
				</Collapse>
			</div>
		);
	}

	// Aggressive Variant
	if (designVariant === 'aggressive') {
		return (
			<div onClick={(e) => e.stopPropagation()}>
				<Collapse ghost activeKey={activeKey} style={{ marginBottom: '16px', padding: 0 }}>
					<Panel
						header={
							<Flex gap={8} align="center">
								<Text style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>🔍</Text>
								<Text
									type="secondary"
									style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 600 }}
								>
									{t('deepDive')}
								</Text>
							</Flex>
						}
						key="etymology"
					>
						<div style={{ paddingLeft: '24px' }}>
							{etymology.parts.map((part, index) => (
								<div
									key={index}
									style={{
										marginBottom: '20px',
										padding: '16px',
										background: `${token.colorPrimary}08`,
										borderRadius: token.borderRadius,
									}}
								>
									<Flex gap={8} align="center" style={{ marginBottom: '8px' }}>
										<Text
											strong
											style={{
												fontSize: 'clamp(18px, 4.5vw, 20px)',
												color: token.colorTextHeading,
												fontWeight: 700,
											}}
										>
											{part.kanji}
										</Text>
										<Text
											style={{
												fontSize: 'clamp(12px, 2.8vw, 13px)',
												color: token.colorPrimary,
												background: token.colorPrimaryBg,
												padding: '4px 10px',
												borderRadius: '6px',
												fontWeight: 600,
											}}
										>
											{part.han_viet}
										</Text>
									</Flex>
									<Text
										style={{
											fontSize: 'clamp(14px, 3.5vw, 15px)',
											color: token.colorText,
											lineHeight: '1.6',
											fontWeight: 500,
										}}
									>
										{part.meaning[locale] || part.meaning.en}
									</Text>
								</div>
							))}
							{etymology.note && (
								<div
									style={{
										marginTop: '20px',
										padding: '16px',
										background: `${token.colorPrimary}12`,
										borderRadius: token.borderRadius,
										border: `1px solid ${token.colorPrimaryBorder}`,
									}}
								>
									<Flex gap={8} align="center" style={{ marginBottom: '10px' }}>
										<Text style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>💡</Text>
										<Text
											type="secondary"
											style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 600 }}
										>
											{t('insight')}
										</Text>
									</Flex>
									<Text
										style={{
											fontSize: 'clamp(13px, 3vw, 14px)',
											color: token.colorText,
											lineHeight: '1.6',
											fontWeight: 500,
										}}
									>
										{etymology.note[locale] || etymology.note.en}
									</Text>
								</div>
							)}
						</div>
					</Panel>
				</Collapse>
			</div>
		);
	}

	// Minimalist Variant
	return (
		<div onClick={(e) => e.stopPropagation()}>
			<Collapse ghost activeKey={activeKey} style={{ marginBottom: '24px', padding: 0 }}>
				<Panel
					header={
						<Text
							type="secondary"
							style={{
								fontSize: 'clamp(12px, 3vw, 13px)',
								fontWeight: 400,
								letterSpacing: '0.02em',
							}}
						>
							{t('etymology')}
						</Text>
					}
					key="etymology"
				>
					<div style={{ paddingLeft: '20px' }}>
						{etymology.parts.map((part, index) => (
							<div key={index} style={{ marginBottom: '20px' }}>
								<Flex gap={12} align="baseline" style={{ marginBottom: '6px' }}>
									<Text
										style={{
											fontSize: 'clamp(14px, 3.5vw, 16px)',
											color: token.colorTextHeading,
											fontWeight: 500,
										}}
									>
										{part.kanji}
									</Text>
									<Text
										type="secondary"
										style={{
											fontSize: 'clamp(10px, 2.2vw, 11px)',
											letterSpacing: '0.05em',
										}}
									>
										{part.han_viet}
									</Text>
								</Flex>
								<Text
									style={{
										fontSize: 'clamp(13px, 3vw, 14px)',
										color: token.colorTextDescription,
										lineHeight: '1.6',
									}}
								>
									{part.meaning[locale] || part.meaning.en}
								</Text>
							</div>
						))}
						{etymology.note && (
							<div
								style={{
									marginTop: '20px',
									paddingTop: '16px',
									borderTop: `1px solid ${token.colorBorder}`,
									opacity: 0.6,
								}}
							>
								<Text
									style={{
										fontSize: 'clamp(12px, 2.8vw, 13px)',
										color: token.colorTextDescription,
										lineHeight: '1.6',
										fontStyle: 'italic',
									}}
								>
									{etymology.note[locale] || etymology.note.en}
								</Text>
							</div>
						)}
					</div>
				</Panel>
			</Collapse>
		</div>
	);
};
