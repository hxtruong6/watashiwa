'use client';

import type { EtymologyData } from '@/lib/schemas/jsonb';
import { CollapsibleSection } from '@/modules/shared/components/CollapsibleSection';
import { HanVietBadge } from '@/modules/vocabulary/components/HanVietBadge';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Text } = Typography;

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

	const renderContent = () => (
		<div style={{ padding: '0' }}>
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
						<HanVietBadge hanViet={part.han_viet} size="small" />
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
	);

	// Safe Variant
	if (designVariant === 'safe') {
		return (
			<CollapsibleSection
				title={t('etymology')}
				icon={<SearchOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />}
				defaultExpanded={defaultExpanded}
			>
				{renderContent()}
			</CollapsibleSection>
		);
	}

	// Aggressive Variant
	if (designVariant === 'aggressive') {
		const renderAggressiveContent = () => (
			<div style={{ padding: '0' }}>
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
							<HanVietBadge hanViet={part.han_viet} size="medium" />
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
							<InfoCircleOutlined style={{ fontSize: 14, color: token.colorTextSecondary }} />
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
		);

		return (
			<CollapsibleSection
				title={t('deepDive')}
				icon={<SearchOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />}
				defaultExpanded={defaultExpanded}
			>
				{renderAggressiveContent()}
			</CollapsibleSection>
		);
	}

	// Minimalist Variant
	const renderMinimalistContent = () => (
		<div style={{ padding: '0' }}>
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
						<HanVietBadge hanViet={part.han_viet} size="small" />
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
	);

	return (
		<CollapsibleSection
			title={t('etymology')}
			icon={<SearchOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />}
			defaultExpanded={defaultExpanded}
		>
			{renderMinimalistContent()}
		</CollapsibleSection>
	);
};
