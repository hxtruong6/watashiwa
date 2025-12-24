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
				{/* READING (Furigana Hint) */}
				<div
					style={{
						minHeight: 24,
						opacity: showFurigana && front.reading ? 1 : 0,
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
	return (
		<Flex vertical style={{ height: '100%', padding: '32px', textAlign: 'left', width: '100%' }}>
			{/* 1. Header: Kana + Target Word */}
			<Flex justify="space-between" align="flex-start" style={{ marginBottom: '24px' }}>
				<div>
					<Text type="secondary" style={{ fontSize: '16px' }}>
						{front.reading}
					</Text>
					<Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
						{front.hero}
					</Title>
				</div>

				{/* Hán Việt Badge */}
				{back.han_viet && (
					<div
						style={{
							background: token.colorPrimaryBg,
							padding: '4px 8px',
							borderRadius: '4px',
							border: `1px solid ${token.colorPrimaryBorder}`,
						}}
					>
						<Text
							strong
							style={{ color: token.colorPrimary, textTransform: 'uppercase', fontSize: '12px' }}
						>
							{back.han_viet}
						</Text>
					</div>
				)}
			</Flex>

			{/* 2. Primary Meaning */}
			<div style={{ marginBottom: 'auto' }}>
				<Text style={{ fontSize: '20px', fontWeight: 500, color: token.colorText }}>
					{back.meaning}
				</Text>
			</div>

			{/* 3. Etymology / Mnemonic Box */}
			{/* Note: In V2 schema, we might have back.details.etymology. For now using usage_example or details if available */}
			{/* We need to be careful about what data is actually passed in 'back'. Check types.ts StandardCard */}

			<div
				style={{
					background: token.colorFillAlter,
					padding: '16px',
					borderRadius: '8px',
					marginTop: '16px',
				}}
			>
				<Flex gap="small" align="center" style={{ marginBottom: '8px' }}>
					<BulbFilled style={{ color: token.colorWarning }} />
					<Text strong style={{ fontSize: '12px', color: token.colorTextSecondary }}>
						EXAMPLE
					</Text>
				</Flex>
				<Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
					{back.usage_example || 'No example available.'}
				</Text>
			</div>
		</Flex>
	);
};
