'use client';

import { SmartCard } from '@/types/smart-cube';
import { BulbFilled, SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface BasicFaceProps {
	card: SmartCard;
	side: 'front' | 'back';
	onPlayAudio?: () => void;
}

export const BasicFace: React.FC<BasicFaceProps> = ({ card, side, onPlayAudio }) => {
	const { token } = theme.useToken();
	const { front, back } = card;

	// FRONT DESIGN
	if (side === 'front') {
		return (
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ height: '100%', position: 'relative' }}
			>
				{/* HERO KANJI */}
				<Title
					level={1}
					style={{
						fontSize: '64px',
						fontWeight: 500,
						marginBottom: '8px',
						color: token.colorTextHeading,
					}}
				>
					{front.hero}
				</Title>

				{/* Audio Trigger (Subtle) */}
				{front.audio && (
					<Button
						shape="circle"
						icon={<SoundOutlined />}
						size="large"
						type="text"
						onClick={(e) => {
							e.stopPropagation();
							onPlayAudio?.();
						}}
						style={{ position: 'absolute', bottom: '32px', right: '32px', opacity: 0.6 }}
					/>
				)}
			</Flex>
		);
	}

	// BACK DESIGN
	return (
		<Flex vertical style={{ height: '100%', padding: '32px', textAlign: 'left' }}>
			{/* 1. Header: Kanji + Kana */}
			<Flex justify="space-between" align="flex-start" style={{ marginBottom: '24px' }}>
				<div>
					<Text type="secondary" style={{ fontSize: '14px' }}>
						{back.details.kana}
					</Text>
					<Title level={3} style={{ margin: 0 }}>
						{front.hero}
					</Title>
				</div>
				{/* Hán Việt Highlight */}
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
						{back.details.han_viet}
					</Text>
				</div>
			</Flex>

			{/* 2. Primary Meaning */}
			<div style={{ marginBottom: 'auto' }}>
				<Text style={{ fontSize: '18px', fontWeight: 500 }}>{back.meanings.join(', ')}</Text>
			</div>

			{/* 3. Etymology Box (The Insight) */}
			{back.details.etymology && (
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
						<Text strong style={{ fontSize: '12px' }}>
							ORIGIN
						</Text>
					</Flex>
					<Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
						{back.details.etymology.breakdown}
					</Text>
				</div>
			)}
		</Flex>
	);
};
