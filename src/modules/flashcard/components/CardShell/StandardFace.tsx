'use client';

import type { CardBackSettings } from '@/modules/study/store/useStudyPreferences';
import {
	BookOutlined,
	BulbFilled,
	CheckCircleOutlined,
	PauseCircleOutlined,
	SoundOutlined,
} from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import { useLocale } from 'next-intl';
import React from 'react';

import { StandardCard } from '../../types';
import { ConfusionsSection } from './Sections/ConfusionsSection';
import { EtymologySection } from './Sections/EtymologySection';
import { MoreExamplesSection } from './Sections/MoreExamplesSection';

const { Title, Text } = Typography;

type DesignVariant = 'safe' | 'aggressive' | 'minimalist';

interface StandardFaceProps {
	card: StandardCard;
	side: 'front' | 'back';

	// Display Options (Passed from Session Store/Settings)
	showFurigana?: boolean;
	showRomaji?: boolean;

	// Audio State
	isPlaying?: boolean;
	onPlayAudio?: (e: React.MouseEvent) => void;

	// Design Variant
	designVariant?: DesignVariant;

	// Card Back Settings
	cardBackSettings?: CardBackSettings;
}

export const StandardFace: React.FC<StandardFaceProps> = ({
	card,
	side,
	showFurigana = true,
	showRomaji = false,
	isPlaying = false,
	onPlayAudio,
	designVariant = 'safe',
	cardBackSettings,
}) => {
	const { token } = theme.useToken();
	const locale = (useLocale() as 'vi' | 'en') || 'vi';
	const { front, back } = card;

	// Get settings with defaults
	const settings = cardBackSettings || {
		showEtymology: false,
		showConfusions: true,
		showMoreExamples: false,
		defaultCollapseState: {
			etymology: 'collapsed' as const,
			confusions: 'expanded' as const,
			moreExamples: 'collapsed' as const,
		},
	};

	// FRONT DESIGN
	if (side === 'front') {
		const hasAudio = !!front.audio;

		return (
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ height: '100%', position: 'relative', width: '100%' }}
			>
				<div
					style={{
						minHeight: 24,
						opacity: showFurigana && front.reading !== front.hero ? 1 : 0,
						transition: 'opacity 0.3s ease',
						marginBottom: 4,
					}}
				>
					<Text type="secondary" style={{ fontSize: 18 }}>
						{front.reading || ''}
					</Text>
				</div>

				{/* HERO KANJI/WORD */}
				<Title
					level={1}
					style={{
						fontSize: 'clamp(40px, 12vw, 64px)', // Responsive Text
						fontWeight: 500,
						margin: '0 0 16px 0',
						color: token.colorPrimary,
						textAlign: 'center',
						lineHeight: 1.2,
					}}
				>
					{front.hero}
				</Title>

				{/* AUDIO BUTTON */}
				{hasAudio && (
					<Button
						type="text"
						shape="circle"
						icon={
							isPlaying ? (
								<PauseCircleOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
							) : (
								<SoundOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
							)
						}
						onClick={(e) => {
							e.stopPropagation();
							onPlayAudio?.(e);
						}}
						style={{
							position: 'absolute',
							bottom: 32,
							right: 32,
							width: 48,
							height: 48,
							opacity: 0.8,
							background: 'rgba(255,255,255,0.5)',
							backdropFilter: 'blur(4px)',
						}}
					/>
				)}
			</Flex>
		);
	}

	// BACK DESIGN
	// Defensive: Handle missing or malformed data gracefully
	if (!back?.details) {
		console.error('[StandardFace] Missing back.details:', { card, back });
		return (
			<Flex vertical align="center" justify="center" style={{ height: '100%', padding: '24px' }}>
				<Text type="danger">Error: Card data missing</Text>
			</Flex>
		);
	}

	const hasReading = !!front.reading;
	// Safe access to meanings with fallback
	const meanings = back.details.meanings || {};
	const primaryMeaning =
		(meanings.vi && Array.isArray(meanings.vi) && meanings.vi[0]) ||
		(meanings.en && Array.isArray(meanings.en) && meanings.en[0]) ||
		'';
	const hasExample =
		back.details.examples &&
		Array.isArray(back.details.examples) &&
		back.details.examples.length > 0;
	const example = hasExample ? back.details.examples[0] : null;
	const hasMnemonic = !!back.details.mnemonic;
	const mnemonic =
		hasMnemonic && back.details.mnemonic
			? back.details.mnemonic.vi || back.details.mnemonic.en
			: null;

	const hanVietBadge = back.details.hanViet ? (
		<div
			style={{
				background: token.colorPrimaryBg,
				padding: '2px 8px',
				borderRadius: '6px',
				border: `1px solid ${token.colorPrimaryBorder}`,
				display: 'inline-flex',
				alignItems: 'center',
				height: '24px',
			}}
		>
			<Text
				strong
				style={{
					color: token.colorPrimary,
					fontSize: '11px',
					letterSpacing: '0.05em',
				}}
			>
				{back.details.hanViet}
			</Text>
		</div>
	) : null;

	// Render based on design variant
	if (designVariant === 'safe') {
		return (
			<Flex
				vertical
				style={{
					height: '100%',
					padding: '40px 32px 32px 32px',
					textAlign: 'left',
					width: '100%',
				}}
			>
				{/* 1. Meta Row: Reading + Badge + Audio */}
				<Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
					<Flex gap="12px" align="center">
						{hasReading && (
							<Text type="secondary" style={{ fontSize: '18px', fontWeight: 400 }}>
								{front.reading}
							</Text>
						)}
						{hanVietBadge}
					</Flex>

					{front.audio && (
						<Button
							type="text"
							shape="circle"
							size="small"
							icon={
								isPlaying ? (
									<PauseCircleOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
								) : (
									<SoundOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
								)
							}
							onClick={(e) => {
								e.stopPropagation();
								onPlayAudio?.(e);
							}}
						/>
					)}
				</Flex>

				{/* 2. Primary Meaning (Hero - Centered) */}
				<Flex
					vertical
					align="center"
					style={{
						marginBottom: '32px',
						padding: '24px',
						background: `${token.colorPrimary}0A`, // 10% opacity
						borderRadius: token.borderRadiusLG,
					}}
				>
					<Text
						style={{
							fontSize: 'clamp(28px, 8vw, 36px)',
							fontWeight: 600,
							color: token.colorTextHeading,
							lineHeight: 1.3,
							letterSpacing: '-0.02em',
							textAlign: 'center',
						}}
					>
						{primaryMeaning}
					</Text>
				</Flex>

				{/* 3. Example (Card-style) */}
				{hasExample && (
					<div
						style={{
							marginBottom: hasMnemonic ? '24px' : '0',
							padding: '16px',
							background: token.colorFillAlter,
							borderRadius: token.borderRadius,
						}}
					>
						<Flex gap={8} align="center" style={{ marginBottom: '12px' }}>
							<BookOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
							<Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
								Example
							</Text>
						</Flex>
						<Text
							style={{
								fontSize: '15px',
								color: token.colorText,
								lineHeight: '1.6',
								display: 'block',
								marginBottom: '8px',
							}}
						>
							{example?.sentence}
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
								fontSize: '13px',
								color: token.colorTextDescription,
								lineHeight: '1.5',
							}}
						>
							{example?.translation?.vi || example?.translation?.en || ''}
						</Text>
					</div>
				)}

				{/* 4. Mnemonic (Distinct style) */}
				{hasMnemonic && (
					<div
						style={{
							padding: '16px',
							background: token.colorPrimaryBg,
							borderRadius: token.borderRadius,
							border: `1px solid ${token.colorPrimaryBorder}`,
							marginTop: !hasExample ? 'auto' : '0',
							marginBottom: '16px',
						}}
					>
						<Flex gap={8} align="center" style={{ marginBottom: '8px' }}>
							<BulbFilled style={{ fontSize: 16, color: token.colorPrimary }} />
							<Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
								Memory Tip
							</Text>
						</Flex>
						<Text
							style={{
								fontSize: '14px',
								color: token.colorText,
								lineHeight: '1.5',
							}}
						>
							{mnemonic}
						</Text>
					</div>
				)}

				{/* 5. Collapsible Sections */}
				{settings.showConfusions && (
					<ConfusionsSection
						vocabId={card.vocabId}
						confusions={(back.details as any)?.confusions}
						designVariant={designVariant}
						defaultExpanded={settings.defaultCollapseState.confusions === 'expanded'}
						locale={locale}
					/>
				)}

				{settings.showEtymology && back.details.etymology && (
					<EtymologySection
						etymology={back.details.etymology}
						designVariant={designVariant}
						defaultExpanded={settings.defaultCollapseState.etymology === 'expanded'}
						locale={locale}
					/>
				)}

				{settings.showMoreExamples && back.details.examples && back.details.examples.length > 1 && (
					<MoreExamplesSection
						examples={back.details.examples}
						firstExampleIndex={0}
						designVariant={designVariant}
						defaultExpanded={settings.defaultCollapseState.moreExamples === 'expanded'}
						locale={locale}
					/>
				)}
			</Flex>
		);
	}

	if (designVariant === 'aggressive') {
		return (
			<Flex
				vertical
				style={{
					height: '100%',
					padding: '32px 32px 32px 32px',
					textAlign: 'left',
					width: '100%',
				}}
			>
				{/* 1. Meta Row: Reading + Badge + Audio (Minimal) */}
				<Flex justify="space-between" align="center" style={{ marginBottom: '20px' }}>
					<Flex gap="12px" align="center">
						{hasReading && (
							<Text type="secondary" style={{ fontSize: '16px', fontWeight: 400 }}>
								{front.reading}
							</Text>
						)}
						{hanVietBadge}
					</Flex>

					{front.audio && (
						<Button
							type="text"
							shape="circle"
							size="small"
							icon={
								isPlaying ? (
									<PauseCircleOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
								) : (
									<SoundOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
								)
							}
							onClick={(e) => {
								e.stopPropagation();
								onPlayAudio?.(e);
							}}
						/>
					)}
				</Flex>

				{/* 2. Primary Meaning (Celebrated Hero) */}
				<Flex
					vertical
					align="center"
					style={{
						marginBottom: '24px',
						padding: '28px 20px',
						background: `linear-gradient(135deg, ${token.colorPrimary}08 0%, transparent 100%)`,
						borderRadius: token.borderRadiusLG,
						position: 'relative',
					}}
				>
					<CheckCircleOutlined
						style={{
							fontSize: 24,
							color: token.colorSuccess,
							marginBottom: '12px',
							opacity: 0.8,
						}}
					/>
					<Text
						style={{
							fontSize: 'clamp(32px, 9vw, 40px)',
							fontWeight: 700,
							color: token.colorTextHeading,
							lineHeight: 1.2,
							letterSpacing: '-0.03em',
							textAlign: 'center',
							textShadow: `0 2px 8px ${token.colorPrimary}15`,
						}}
					>
						{primaryMeaning}
					</Text>
				</Flex>

				{/* Divider */}
				<div
					style={{
						height: '1px',
						background: `linear-gradient(90deg, transparent, ${token.colorBorder}, transparent)`,
						marginBottom: '24px',
					}}
				/>

				{/* 3. Example (Speech bubble style) */}
				{hasExample && (
					<div
						style={{
							marginBottom: hasMnemonic ? '20px' : '0',
							padding: '16px 20px',
							background: token.colorFillAlter,
							borderRadius: '16px 16px 16px 4px',
							position: 'relative',
						}}
					>
						<Flex gap={8} align="center" style={{ marginBottom: '10px' }}>
							<Text style={{ fontSize: 18 }}>💬</Text>
							<Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
								Real Usage
							</Text>
						</Flex>
						<Text
							style={{
								fontSize: '18px',
								color: token.colorText,
								lineHeight: '1.6',
								display: 'block',
								marginBottom: '10px',
								fontWeight: 500,
							}}
						>
							{example?.sentence}
						</Text>
						<Text
							style={{
								fontSize: '14px',
								color: token.colorTextDescription,
								lineHeight: '1.5',
							}}
						>
							{example?.translation?.vi || example?.translation?.en || ''}
						</Text>
					</div>
				)}

				{/* 4. Mnemonic (Brain icon, highlighted) */}
				{hasMnemonic && (
					<div
						style={{
							padding: '16px 20px',
							background: `${token.colorPrimary}18`, // 15% opacity
							borderRadius: token.borderRadius,
							border: `1px solid ${token.colorPrimaryBorder}`,
							marginTop: !hasExample ? 'auto' : '0',
							marginBottom: '20px',
						}}
					>
						<Flex gap={8} align="center" style={{ marginBottom: '10px' }}>
							<Text style={{ fontSize: 18 }}>🧠</Text>
							<Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>
								Memory Hook
							</Text>
						</Flex>
						<Text
							style={{
								fontSize: '14px',
								color: token.colorText,
								lineHeight: '1.5',
								fontWeight: 500,
							}}
						>
							{mnemonic}
						</Text>
					</div>
				)}

				{/* 5. Collapsible Sections */}
				{settings.showConfusions && (
					<ConfusionsSection
						vocabId={card.vocabId}
						confusions={(back.details as any)?.confusions}
						designVariant={designVariant}
						defaultExpanded={settings.defaultCollapseState.confusions === 'expanded'}
						locale={locale}
					/>
				)}

				{settings.showEtymology && back.details.etymology && (
					<EtymologySection
						etymology={back.details.etymology}
						designVariant={designVariant}
						defaultExpanded={settings.defaultCollapseState.etymology === 'expanded'}
						locale={locale}
					/>
				)}

				{settings.showMoreExamples && back.details.examples && back.details.examples.length > 1 && (
					<MoreExamplesSection
						examples={back.details.examples}
						firstExampleIndex={0}
						designVariant={designVariant}
						defaultExpanded={settings.defaultCollapseState.moreExamples === 'expanded'}
						locale={locale}
					/>
				)}
			</Flex>
		);
	}

	// Minimalist variant
	return (
		<Flex
			vertical
			style={{
				height: '100%',
				padding: '60px 40px 40px 40px',
				textAlign: 'left',
				width: '100%',
			}}
		>
			{/* 1. Meta Row: Reading + Badge + Audio (Ultra-minimal) */}
			<Flex justify="space-between" align="center" style={{ marginBottom: '32px' }}>
				<Flex gap="12px" align="center">
					{hasReading && (
						<Text type="secondary" style={{ fontSize: '16px', fontWeight: 300 }}>
							{front.reading}
						</Text>
					)}
					{hanVietBadge}
				</Flex>

				{front.audio && (
					<Button
						type="text"
						shape="circle"
						size="small"
						icon={
							isPlaying ? (
								<PauseCircleOutlined style={{ fontSize: 16, color: token.colorTextTertiary }} />
							) : (
								<SoundOutlined style={{ fontSize: 16, color: token.colorTextTertiary }} />
							)
						}
						onClick={(e) => {
							e.stopPropagation();
							onPlayAudio?.(e);
						}}
					/>
				)}
			</Flex>

			{/* 2. Primary Meaning (Clean, spacious) */}
			<Text
				style={{
					fontSize: 'clamp(28px, 7vw, 32px)',
					fontWeight: 500,
					color: token.colorTextHeading,
					lineHeight: 1.4,
					letterSpacing: '-0.01em',
					marginBottom: '48px',
				}}
			>
				{primaryMeaning}
			</Text>

			{/* Subtle divider */}
			<div
				style={{
					height: '1px',
					background: token.colorBorder,
					marginBottom: '32px',
					opacity: 0.3,
				}}
			/>

			{/* 3. Example (Minimal styling) */}
			{hasExample && (
				<div style={{ marginBottom: hasMnemonic ? '32px' : '0' }}>
					<Text
						style={{
							fontSize: '16px',
							color: token.colorText,
							lineHeight: '1.7',
							display: 'block',
							marginBottom: '8px',
							fontWeight: 400,
						}}
					>
						{example?.sentence}
					</Text>
					<Text
						style={{
							fontSize: '14px',
							color: token.colorTextDescription,
							lineHeight: '1.6',
						}}
					>
						{example?.translation?.vi || example?.translation?.en || ''}
					</Text>
				</div>
			)}

			{/* 4. Mnemonic (Italic, subtle) */}
			{hasMnemonic && (
				<Text
					italic
					style={{
						fontSize: '13px',
						color: token.colorTextDescription,
						lineHeight: '1.6',
						marginTop: !hasExample ? 'auto' : '0',
						marginBottom: '24px',
						opacity: 0.8,
					}}
				>
					{mnemonic}
				</Text>
			)}

			{/* 5. Collapsible Sections */}
			{settings.showConfusions && (
				<ConfusionsSection
					vocabId={card.vocabId}
					confusions={(back.details as any)?.confusions}
					designVariant={designVariant}
					defaultExpanded={settings.defaultCollapseState.confusions === 'expanded'}
					locale={locale}
				/>
			)}

			{settings.showEtymology && back.details.etymology && (
				<EtymologySection
					etymology={back.details.etymology}
					designVariant={designVariant}
					defaultExpanded={settings.defaultCollapseState.etymology === 'expanded'}
					locale={locale}
				/>
			)}

			{settings.showMoreExamples && back.details.examples && back.details.examples.length > 1 && (
				<MoreExamplesSection
					examples={back.details.examples}
					firstExampleIndex={0}
					designVariant={designVariant}
					defaultExpanded={settings.defaultCollapseState.moreExamples === 'expanded'}
					locale={locale}
				/>
			)}
		</Flex>
	);
};
