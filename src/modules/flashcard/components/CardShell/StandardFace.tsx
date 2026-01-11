'use client';

import { isKanjiOnly, isKatakanaOnly } from '@/lib/utils/furigana';
import { CollapsibleSection } from '@/modules/shared/components/CollapsibleSection';
import type { CardBackSettings } from '@/modules/study/store/useStudyPreferences';
import { HanVietBadge } from '@/modules/vocabulary/components/HanVietBadge';
import {
	BookOutlined,
	BulbFilled,
	CheckCircleOutlined,
	InfoCircleOutlined,
	PauseCircleOutlined,
	SoundOutlined,
} from '@ant-design/icons';
import { Button, Flex, Grid, Typography, theme } from 'antd';
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

	// Callback for showing details (sidebar/modal)
	onShowDetails?: () => void;
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
	onShowDetails,
}) => {
	const { token } = theme.useToken();
	const locale = (useLocale() as 'vi' | 'en') || 'vi';
	const { front, back } = card;
	const { useBreakpoint } = Grid;
	const screens = useBreakpoint();
	const isDesktop = screens.md; // ≥768px

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
		// For kanji-only or katakana-only words, always show reading if it exists
		// For other words, show reading only if it differs from hero and showFurigana is true
		const isKanjiOrKatakanaOnly = isKanjiOnly(front.hero) || isKatakanaOnly(front.hero);
		const shouldShowReading =
			front.reading && (isKanjiOrKatakanaOnly || (showFurigana && front.reading !== front.hero));

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
						opacity: shouldShowReading ? 1 : 0,
						transition: 'opacity 0.3s ease',
						marginBottom: screens.xs ? 8 : 12,
					}}
				>
					<Text
						type="secondary"
						style={{
							fontSize: screens.xs ? 16 : 18,
							fontWeight: 400,
							color: token.colorTextSecondary,
							letterSpacing: '0.02em',
						}}
					>
						{front.reading || ''}
					</Text>
				</div>

				{/* HERO KANJI/WORD */}
				<Title
					level={1}
					style={{
						fontSize: screens.xs ? 'clamp(36px, 10vw, 56px)' : 'clamp(40px, 12vw, 64px)',
						fontWeight: 500,
						margin: '0 0 16px 0',
						color: token.colorPrimary,
						textAlign: 'center',
						lineHeight: 1.2,
						letterSpacing: '-0.01em',
						textShadow: `0 2px 4px ${token.colorPrimary}15`, // Subtle shadow for depth
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
							bottom: screens.xs ? 24 : 32,
							right: screens.xs ? 24 : 32,
							width: screens.xs ? 44 : 48,
							height: screens.xs ? 44 : 48,
							background: `${token.colorBgBase}E6`, // ~90% opacity using theme token
							backdropFilter: 'blur(8px)',
							border: `1px solid ${token.colorBorderSecondary || token.colorBorder}`,
							boxShadow: token.boxShadowSecondary || '0 2px 8px rgba(0,0,0,0.1)',
							transition: 'all 0.2s ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = `${token.colorPrimary}15`;
							e.currentTarget.style.transform = 'scale(1.05)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = `${token.colorBgBase}E6`;
							e.currentTarget.style.transform = 'scale(1)';
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
	// Check if audio is available (either file URL or TTS fallback)
	const hasAudio = !!front.audio || !!front.hero; // Show audio button if audio URL exists OR if we have text for TTS
	// Safe access to meanings with fallback
	const meanings = back.details.meanings || {};
	const primaryMeaning =
		(meanings.vi && Array.isArray(meanings.vi) && meanings.vi[0]) ||
		(meanings.en && Array.isArray(meanings.en) && meanings.en[0]) ||
		'';
	// UX Improvement: Show all meanings, not just the first one
	const allMeanings =
		meanings.vi && Array.isArray(meanings.vi)
			? meanings.vi
			: meanings.en && Array.isArray(meanings.en)
				? meanings.en
				: [];
	const hasMultipleMeanings = allMeanings.length > 1;
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

	const detailsAny = back.details as unknown as Record<string, unknown>;
	const tags = Array.isArray(detailsAny?.tags) ? (detailsAny.tags as string[]) : [];
	const pitchSvgPath = (detailsAny?.pitchSvgPath as string) || '';

	const hanVietBadge = back.details.hanViet ? (
		<HanVietBadge hanViet={back.details.hanViet} size="medium" />
	) : null;

	// Render based on design variant
	if (designVariant === 'safe') {
		return (
			<Flex
				vertical
				style={{
					paddingTop: 'max(calc(50% - 150px), 40px)', // Centers content, min 40px
					paddingBottom: 'max(calc(50% - 150px), 32px)', // Centers content, min 32px
					paddingLeft: '32px',
					paddingRight: '32px',
					textAlign: 'left',
					width: '100%',
				}}
			>
				{/* 0. Hero Word/Kanji - Visual anchor connecting front and back */}
				<Flex
					vertical
					align="center"
					style={{
						marginBottom: '20px',
					}}
				>
					<Title
						level={2}
						style={{
							fontSize: screens.xs ? 'clamp(32px, 8vw, 40px)' : 'clamp(36px, 9vw, 44px)',
							fontWeight: 500,
							margin: 0,
							color: token.colorPrimary,
							textAlign: 'center',
							lineHeight: 1.2,
							letterSpacing: '-0.01em',
							opacity: 0.85, // Slightly muted to keep focus on meaning
							textShadow: `0 1px 3px ${token.colorPrimary}10`,
						}}
					>
						{front.hero}
					</Title>
				</Flex>

				{/* 1. Meta Row: Reading + Badge + Audio + Info */}
				<Flex justify="space-between" align="flex-start" style={{ marginBottom: '24px' }}>
					<Flex vertical gap={4} style={{ flex: 1 }}>
						<Flex gap="12px" align="center" wrap="wrap">
							{hasReading && (
								<Text
									type="secondary"
									style={{
										fontSize: screens.xs ? 'clamp(20px, 5vw, 24px)' : 'clamp(22px, 6vw, 28px)',
										fontWeight: 400,
									}}
								>
									{front.reading}
								</Text>
							)}
							{hanVietBadge}
						</Flex>
					</Flex>

					<Flex gap={8} align="center">
						{/* Info button for details (tags, pitch, etc.) */}
						{(tags.length > 0 || pitchSvgPath) && onShowDetails && (
							<Button
								type="text"
								shape="circle"
								size="small"
								icon={
									<InfoCircleOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
								}
								onClick={(e) => {
									e.stopPropagation();
									onShowDetails();
								}}
								title="Show details"
							/>
						)}
						{hasAudio && (
							<Button
								type="text"
								shape="circle"
								size="small"
								icon={
									isPlaying ? (
										<PauseCircleOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
									) : (
										<SoundOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
									)
								}
								onClick={(e) => {
									e.stopPropagation();
									onPlayAudio?.(e);
								}}
								title="Play audio"
							/>
						)}
					</Flex>
				</Flex>

				{/* 2. Primary Meaning (Hero - Centered) */}
				<Flex
					vertical
					align="center"
					style={{
						marginBottom: '32px',
						padding: screens.xs ? '20px' : '24px',
						background: `${token.colorPrimary}0D`, // ~5% opacity - subtle highlight
						borderRadius: token.borderRadiusLG,
						border: `1px solid ${token.colorPrimary}20`, // Subtle border
						boxShadow: `0 2px 8px ${token.colorPrimary}08`, // Subtle shadow
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
							marginBottom: hasMultipleMeanings ? '12px' : 0,
						}}
					>
						{primaryMeaning}
					</Text>
					{/* UX Improvement: Show all meanings if multiple exist */}
					{hasMultipleMeanings && (
						<Flex vertical gap={4} style={{ width: '100%', marginTop: '8px' }}>
							{allMeanings.slice(1).map((meaning, idx) => (
								<Text
									key={idx}
									type="secondary"
									style={{
										fontSize: 'clamp(16px, 4vw, 18px)',
										fontWeight: 400,
										textAlign: 'center',
										lineHeight: 1.4,
									}}
								>
									{meaning}
								</Text>
							))}
						</Flex>
					)}
				</Flex>

				{/* 3. Example (Card-style) - Collapsible */}
				{hasExample && (
					<CollapsibleSection
						key={`example-${card.vocabId}`}
						title="Example"
						icon={<BookOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />}
						defaultExpanded={isDesktop}
					>
						<div
							style={{
								padding: '0',
							}}
						>
							<Text
								style={{
									fontSize: '15px',
									color: token.colorText,
									lineHeight: '1.6',
									display: 'block',
									marginBottom: '12px',
								}}
							>
								{example?.sentence}
							</Text>
							<Text
								style={{
									fontSize: '13px',
									color: token.colorTextDescription,
									lineHeight: '1.5',
									display: 'block',
								}}
							>
								{example?.translation?.vi || example?.translation?.en || ''}
							</Text>
						</div>
					</CollapsibleSection>
				)}

				{/* 4. Mnemonic (Distinct style) */}
				{hasMnemonic && (
					<div
						style={{
							padding: screens.xs ? '14px' : '16px',
							background: `${token.colorPrimary}12`, // ~7% opacity - warm highlight
							borderRadius: token.borderRadius,
							border: `1px solid ${token.colorPrimary}30`, // ~19% opacity border
							marginTop: !hasExample ? 'auto' : '0',
							marginBottom: '16px',
							boxShadow: `0 1px 4px ${token.colorPrimary}10`, // Subtle shadow
						}}
					>
						<Flex gap={8} align="center" style={{ marginBottom: '10px' }}>
							<BulbFilled
								style={{
									fontSize: 18,
									color: token.colorPrimary,
									filter: `drop-shadow(0 1px 2px ${token.colorPrimary}40)`,
								}}
							/>
							<Text
								type="secondary"
								style={{
									fontSize: '13px',
									fontWeight: 600,
									color: token.colorTextSecondary,
									textTransform: 'uppercase',
									letterSpacing: '0.05em',
								}}
							>
								Memory Tip
							</Text>
						</Flex>
						<Text
							style={{
								fontSize: screens.xs ? '13px' : '14px',
								color: token.colorText,
								lineHeight: '1.6',
								fontWeight: 400,
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
						key={`etymology-${card.vocabId}`}
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
					padding: '32px 32px 32px 32px',
					textAlign: 'left',
					width: '100%',
				}}
			>
				{/* 0. Hero Word/Kanji - Visual anchor connecting front and back */}
				<Flex
					vertical
					align="center"
					style={{
						marginBottom: '16px',
					}}
				>
					<Title
						level={2}
						style={{
							fontSize: screens.xs ? 'clamp(36px, 9vw, 44px)' : 'clamp(40px, 10vw, 48px)',
							fontWeight: 600,
							margin: 0,
							color: token.colorPrimary,
							textAlign: 'center',
							lineHeight: 1.2,
							letterSpacing: '-0.02em',
							opacity: 0.9,
							textShadow: `0 2px 6px ${token.colorPrimary}20`,
						}}
					>
						{front.hero}
					</Title>
				</Flex>

				{/* 1. Meta Row: Reading + Badge + Audio + Info */}
				<Flex justify="space-between" align="flex-start" style={{ marginBottom: '20px' }}>
					<Flex vertical gap={4} style={{ flex: 1 }}>
						<Flex gap="12px" align="center" wrap="wrap">
							{hasReading && (
								<Text
									type="secondary"
									style={{
										fontSize: screens.xs ? 'clamp(20px, 5vw, 24px)' : 'clamp(22px, 6vw, 28px)',
										fontWeight: 400,
									}}
								>
									{front.reading}
								</Text>
							)}
							{hanVietBadge}
						</Flex>
					</Flex>

					<Flex gap={8} align="center">
						{/* Info button for details (tags, pitch, etc.) */}
						{(tags.length > 0 || pitchSvgPath) && onShowDetails && (
							<Button
								type="text"
								shape="circle"
								size="small"
								icon={
									<InfoCircleOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />
								}
								onClick={(e) => {
									e.stopPropagation();
									onShowDetails();
								}}
								title="Show details"
							/>
						)}
						{hasAudio && (
							<Button
								type="text"
								shape="circle"
								size="small"
								icon={
									isPlaying ? (
										<PauseCircleOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
									) : (
										<SoundOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
									)
								}
								onClick={(e) => {
									e.stopPropagation();
									onPlayAudio?.(e);
								}}
								title="Play audio"
							/>
						)}
					</Flex>
				</Flex>

				{/* 2. Primary Meaning (Celebrated Hero) */}
				<Flex
					vertical
					align="center"
					style={{
						marginBottom: '24px',
						padding: screens.xs ? '24px 16px' : '28px 20px',
						background: `linear-gradient(135deg, ${token.colorPrimary}12 0%, ${token.colorPrimary}08 50%, transparent 100%)`,
						borderRadius: token.borderRadiusLG,
						position: 'relative',
						border: `1px solid ${token.colorPrimary}25`,
						boxShadow: `0 4px 12px ${token.colorPrimary}15`,
					}}
				>
					<CheckCircleOutlined
						style={{
							fontSize: screens.xs ? 20 : 24,
							color: token.colorSuccess,
							marginBottom: '12px',
							filter: `drop-shadow(0 2px 4px ${token.colorSuccess}40)`,
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

				{/* 3. Example (Speech bubble style) - Collapsible */}
				{hasExample && (
					<CollapsibleSection
						key={`example-${card.vocabId}`}
						title="Real Usage"
						icon={<Text style={{ fontSize: 18 }}>💬</Text>}
						defaultExpanded={isDesktop}
					>
						<div
							style={{
								padding: '0',
							}}
						>
							<Text
								style={{
									fontSize: '18px',
									color: token.colorText,
									lineHeight: '1.6',
									display: 'block',
									marginBottom: '12px',
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
									display: 'block',
								}}
							>
								{example?.translation?.vi || example?.translation?.en || ''}
							</Text>
						</div>
					</CollapsibleSection>
				)}

				{/* 4. Mnemonic (Brain icon, highlighted) */}
				{hasMnemonic && (
					<div
						style={{
							padding: screens.xs ? '14px 16px' : '16px 20px',
							background: `${token.colorPrimary}15`, // ~8% opacity
							borderRadius: token.borderRadius,
							border: `1px solid ${token.colorPrimary}35`, // ~21% opacity
							marginTop: !hasExample ? 'auto' : '0',
							marginBottom: '20px',
							boxShadow: `0 2px 6px ${token.colorPrimary}12`,
						}}
					>
						<Flex gap={8} align="center" style={{ marginBottom: '10px' }}>
							<Text style={{ fontSize: screens.xs ? 16 : 18 }}>🧠</Text>
							<Text
								type="secondary"
								style={{
									fontSize: '12px',
									fontWeight: 600,
									textTransform: 'uppercase',
									letterSpacing: '0.05em',
									color: token.colorTextSecondary,
								}}
							>
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
						key={`etymology-${card.vocabId}`}
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
				padding: '60px 40px 40px 40px',
				textAlign: 'left',
				width: '100%',
			}}
		>
			{/* 0. Hero Word/Kanji - Visual anchor connecting front and back */}
			<Flex
				vertical
				align="center"
				style={{
					marginBottom: '24px',
				}}
			>
				<Title
					level={2}
					style={{
						fontSize: screens.xs ? 'clamp(28px, 7vw, 32px)' : 'clamp(32px, 8vw, 36px)',
						fontWeight: 400,
						margin: 0,
						color: token.colorPrimary,
						textAlign: 'center',
						lineHeight: 1.3,
						letterSpacing: '-0.01em',
						opacity: 0.75, // More muted for minimalist design
					}}
				>
					{front.hero}
				</Title>
			</Flex>

			{/* 1. Meta Row: Reading + Badge + Audio + Info */}
			<Flex justify="space-between" align="flex-start" style={{ marginBottom: '32px' }}>
				<Flex vertical gap={4} style={{ flex: 1 }}>
					<Flex gap="12px" align="center" wrap="wrap">
						{hasReading && (
							<Text
								type="secondary"
								style={{
									fontSize: screens.xs ? 'clamp(20px, 5vw, 24px)' : 'clamp(22px, 6vw, 28px)',
									fontWeight: 300,
								}}
							>
								{front.reading}
							</Text>
						)}
						{hanVietBadge}
					</Flex>
				</Flex>

				<Flex gap={8} align="center">
					{/* Info button for details (tags, pitch, etc.) */}
					{(tags.length > 0 || pitchSvgPath) && onShowDetails && (
						<Button
							type="text"
							shape="circle"
							size="small"
							icon={<InfoCircleOutlined style={{ fontSize: 16, color: token.colorTextTertiary }} />}
							onClick={(e) => {
								e.stopPropagation();
								onShowDetails();
							}}
							title="Show details"
						/>
					)}
					{hasAudio && (
						<Button
							type="text"
							shape="circle"
							size="small"
							icon={
								isPlaying ? (
									<PauseCircleOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
								) : (
									<SoundOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
								)
							}
							onClick={(e) => {
								e.stopPropagation();
								onPlayAudio?.(e);
							}}
							title="Play audio"
						/>
					)}
				</Flex>
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

			{/* 3. Example (Minimal styling) - Collapsible */}
			{hasExample && (
				<CollapsibleSection
					key={`example-${card.vocabId}`}
					title="Example"
					icon={<BookOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />}
					defaultExpanded={isDesktop}
				>
					<div style={{ padding: '0' }}>
						<Text
							style={{
								fontSize: '16px',
								color: token.colorText,
								lineHeight: '1.7',
								display: 'block',
								marginBottom: '12px',
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
								display: 'block',
							}}
						>
							{example?.translation?.vi || example?.translation?.en || ''}
						</Text>
					</div>
				</CollapsibleSection>
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
