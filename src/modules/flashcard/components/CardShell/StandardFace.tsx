'use client';

import { BulbFilled, PauseCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import React from 'react';

import { StandardCard } from '../../types';

const { Title, Text } = Typography;

interface StandardFaceProps {
	card: StandardCard;
	side: 'front' | 'back';

	// Display Options (Passed from Session Store/Settings)
	showFurigana?: boolean;
	showRomaji?: boolean;

	// Audio State
	isPlaying?: boolean;
	onPlayAudio?: (e: React.MouseEvent) => void;
}

export const StandardFace: React.FC<StandardFaceProps> = ({
	card,
	side,
	showFurigana = true,
	showRomaji = false,
	isPlaying = false,
	onPlayAudio,
}) => {
	const { token } = theme.useToken();
	const { front, back } = card;

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
	const hasReading = !!front.reading;
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

	return (
		<Flex
			vertical
			style={{ height: '100%', padding: '0 32px 32px 32px', textAlign: 'left', width: '100%' }}
		>
			{/* 1. Meta Row: Reading + Badge + Audio */}
			<Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
				<Flex gap="12px" align="center">
					{/* Always show Reading on Back (Zen: Context for the answer) */}
					{hasReading && (
						<Text type="secondary" style={{ fontSize: '18px', fontWeight: 400 }}>
							{front.reading}
						</Text>
					)}
					{hanVietBadge}
				</Flex>

				{/* Audio Button (Subtle) */}
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

			{/* 2. Primary Meaning (The Core Answer) */}
			<div style={{ marginBottom: '24px' }}>
				<Text
					style={{
						fontSize: '28px',
						fontWeight: 600,
						color: token.colorTextHeading,
						lineHeight: 1.3,
						letterSpacing: '-0.02em',
					}}
				>
					{/* Prioritize Vietnamese, fallback to English */}
					{back.details.meanings.vi?.[0] || back.details.meanings.en?.[0] || ''}
				</Text>
			</div>

			{/* 3. Example (Context) */}
			{back.details.examples && back.details.examples.length > 0 && (
				<div
					style={{
						borderLeft: `3px solid ${token.colorFillSecondary}`,
						paddingLeft: '16px',
						marginTop: 'auto',
						marginBottom: back.details.mnemonic ? '16px' : '0',
					}}
				>
					<Text style={{ fontSize: '15px', color: token.colorTextSecondary, lineHeight: '1.6' }}>
						{back.details.examples[0]?.sentence}
					</Text>
					{/* Translation */}
					<Text
						style={{
							fontSize: '13px',
							color: token.colorTextDescription,
							display: 'block',
							marginTop: '4px',
						}}
					>
						{back.details.examples[0]?.translation?.vi ||
							back.details.examples[0]?.translation?.en ||
							''}
					</Text>
				</div>
			)}

			{/* 4. Mnemonic (Memory Hook) */}
			{back.details.mnemonic && (
				<div
					style={{
						borderLeft: `3px solid ${token.colorPrimary}`, // Distinct color for Mnemonic
						paddingLeft: '16px',
						marginTop: !back.details.examples?.length ? 'auto' : '0',
					}}
				>
					<Text
						italic
						style={{ fontSize: '14px', color: token.colorTextDescription, lineHeight: '1.5' }}
					>
						{back.details.mnemonic.vi || back.details.mnemonic.en}
					</Text>
				</div>
			)}
		</Flex>
	);
};
