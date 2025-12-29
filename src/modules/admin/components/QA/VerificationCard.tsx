'use client';

import { useWorkbenchStore } from '@/modules/admin/store/useWorkbenchStore';
import { ExtendedVocabulary } from '@/types/admin-types';
import { CheckOutlined, CloseOutlined, EditOutlined, SoundOutlined } from '@ant-design/icons';
import {
	Badge,
	Button,
	Card,
	Flex,
	Segmented,
	Select,
	Tag,
	Tooltip,
	Typography,
	theme,
} from 'antd';
import React, { useEffect } from 'react';

import { InlineInput } from './InlineInput';
import { CardEtymology } from './parts/CardEtymology';
import { CardExamples } from './parts/CardExamples';
import { CardMeanings } from './parts/CardMeanings';
import { CardMnemonic } from './parts/CardMnemonic';
import { CardShield } from './parts/CardShield';

const { Text } = Typography;

// Re-export type for compatibility if needed (though prefer import from types)
export type { ExtendedVocabulary };

export interface VerificationCardProps {
	// data prop is now optional or used for initialization if provided,
	// but ideally we rely on store.
	// For specificReadOnly cases, we might need a separate ReadOnlyCard,
	// but here we assume this is the Workbench Editor.
	mode?: 'review' | 'readonly';
	loading?: boolean;
	onApprove?: () => void;
	onReject?: () => void;
	onPlayAudio?: () => void;
	// Hide actions if workbench header handles them
	hideActions?: boolean;
}

const TagColors: Record<string, string> = {
	// Levels
	n5: 'blue',
	n4: 'cyan',
	n3: 'geekblue',
	n2: 'purple',
	n1: 'magenta',
	// POS
	verb: 'green',
	noun: 'orange',
	adj: 'gold',
	adverb: 'lime',
	// Attributes
	transitive: 'volcano',
	intransitive: 'salmon',
	'u-verb': 'geekblue',
	'ru-verb': 'purple',
};

const PitchPatternLabels: Record<number, string> = {
	0: 'Heiban',
	1: 'Atamadaka',
	2: 'Nakadaka',
	3: 'Nakadaka',
	4: 'Kio',
	5: 'Kio',
};

export const VerificationCard: React.FC<VerificationCardProps> = ({
	mode = 'readonly',
	loading = false,
	onApprove,
	onReject,
	onPlayAudio,
	hideActions = false,
}) => {
	const { token } = theme.useToken();

	const { activeItem: data, locale, setLocale, updateField } = useWorkbenchStore();

	// Keyboard shortcut 'T' for translation switch (Global listening still useful here?)
	// Note: InlineInput might swallow some inputs, but global listener usually catches non-input focus.
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 't' || e.key === 'T') {
				const target = e.target as HTMLElement;
				// Avoid switching if typing in input
				if (
					target.tagName !== 'INPUT' &&
					target.tagName !== 'TEXTAREA' &&
					!target.isContentEditable
				) {
					e.preventDefault();
					setLocale(String(locale) === 'vi' ? 'en' : 'vi');
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [locale, setLocale]);

	if (!data) {
		return <Card loading={true} variant="borderless" />;
	}

	return (
		<Card
			loading={loading}
			variant="borderless"
			style={{
				width: '100%',
				margin: '0 auto',
				background: token.colorBgContainer,
				boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
				borderRadius: token.borderRadiusLG * 1.5,
				overflow: 'hidden',
			}}
			styles={{
				body: {
					padding: 0,
					display: 'flex',
					flexDirection: 'column',
					height: 'auto',
					minHeight: '600px',
				},
			}}
			className="verification-card"
			actions={
				mode === 'review' && !hideActions
					? [
							<Button
								key="reject"
								type="text"
								danger
								icon={<CloseOutlined style={{ fontSize: 24 }} />}
								onClick={onReject}
								style={{ height: 60, width: '100%' }}
							/>,
							// Edit button no longer needed as we have inline edit?
							// Or keeps it to toggle "Edit Mode"?
							// With inline edit, we are arguably ALWAYS in edit mode or "Quick Edit".
							<Button
								key="approve"
								type="text"
								className="approve-btn"
								icon={<CheckOutlined style={{ fontSize: 24 }} />}
								onClick={onApprove}
								style={{ height: 60, width: '100%', color: token.colorSuccess }}
							/>,
						]
					: []
			}
		>
			<Flex vertical style={{ height: '100%' }}>
				{/* HEADER (Fixed) */}
				<Flex
					justify="center"
					align="center"
					vertical
					className="relative py-4"
					style={{ flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}
				>
					{/* Pitch Accent Visualization */}
					<div
						style={{
							position: 'relative',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							marginTop: 12,
							width: 'fit-content',
						}}
					>
						{/* Reading & Fallback Pitch */}
						<Flex gap="small" align="baseline" style={{ width: 'fit-content' }}>
							<InlineInput
								value={data.wordReading}
								onChange={(val) => updateField('wordReading', val)}
								placeholder="Reading"
								textStyle={{ fontSize: token.fontSize, color: token.colorTextSecondary }}
							/>
							<Text type="secondary">•</Text>
							<InlineInput
								value={data.wordRomaji || ''}
								onChange={(val) => updateField('wordRomaji', val)}
								placeholder="Romaji"
								textStyle={{ fontSize: token.fontSize, color: token.colorTextSecondary }}
							/>
						</Flex>

						<div
							style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}
						>
							{/* Pitch Select */}
							<Select
								size="small"
								variant="borderless"
								value={data.pitchPattern}
								onChange={(val) => updateField('pitchPattern', val)}
								options={[0, 1, 2, 3, 4, 5].map((v) => ({
									label: `${v} (${PitchPatternLabels[v]})`,
									value: v,
								}))}
								popupMatchSelectWidth={false}
								style={{ width: 'auto', minWidth: 100, fontSize: 12 }}
								suffixIcon={<EditOutlined style={{ fontSize: 10, opacity: 0.5 }} />}
							/>
						</div>

						{/* SVG Overlay if available */}
						{data.pitchSvgPath && (
							<svg
								viewBox="0 0 100 25"
								style={{
									position: 'absolute',
									top: 20, // Adjusted for input height
									left: 0,
									width: '100%',
									height: '25px',
									pointerEvents: 'none',
									opacity: 0.6,
								}}
							>
								<path
									d={data.pitchSvgPath}
									fill="none"
									stroke={token.colorTextSecondary}
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</div>

					{/* HERO KANJI */}
					<div style={{ margin: '4px 0 0 0', width: '100%', textAlign: 'center' }}>
						<InlineInput
							value={data.wordSurface}
							onChange={(val) => updateField('wordSurface', val)}
							textStyle={{
								fontSize: 64,
								fontWeight: 500,
								fontFamily: '"Noto Serif JP", serif',
								color: token.colorTextHeading,
								textAlign: 'center',
							}}
							placeholder="Kanji"
						/>
					</div>

					{/* Audio Button */}
					<Tooltip title="Play Audio (Space)">
						<Button
							type="text"
							shape="circle"
							icon={<SoundOutlined style={{ fontSize: 20 }} />}
							size="large"
							onClick={(e) => {
								e.stopPropagation();
								onPlayAudio?.();
							}}
							style={{
								marginTop: 8,
								color: token.colorTextSecondary,
								background: 'transparent',
							}}
						/>
					</Tooltip>
				</Flex>

				{/* SCROLLABLE BODY */}
				<Flex
					vertical
					gap="large"
					style={{
						flex: 1,
						overflowY: 'auto',
						padding: '16px 24px 24px 24px',
						background: '#fafafa',
					}}
				>
					{/* Tags Row - Subtle */}
					<Flex gap="4px" wrap="wrap" justify="center" style={{ marginBottom: 16 }}>
						{data.tags.map((tag) => (
							<Tag
								key={tag}
								variant="filled"
								color={TagColors[tag] || 'default'}
								style={{
									fontSize: 11,
									margin: 0,
									opacity: 0.8,
								}}
							>
								#{tag}
							</Tag>
						))}
						{/* Locale Switcher */}
						<Segmented
							size="small"
							options={[
								{ label: 'VI', value: 'vi' },
								{ label: 'EN', value: 'en' },
							]}
							value={locale}
							onChange={(v) => setLocale(v as 'vi' | 'en')}
							style={{ marginLeft: 8 }}
						/>
					</Flex>

					{/* Meanings */}
					<div style={{ textAlign: 'center' }}>
						<CardMeanings />
					</div>

					{/* Etymology / Han Viet */}
					<CardEtymology />

					{/* Mnemonic */}
					<CardMnemonic />

					{/* INTERFERENCE SHIELD (Confusions) */}
					<CardShield />

					{/* EXAMPLES (Footer) */}
					<CardExamples />
				</Flex>
			</Flex>
		</Card>
	);
};
