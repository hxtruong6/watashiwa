import { SmartCard } from '@/types/smart-cube';
import { BulbFilled, SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title, Text } = Typography;

interface GapFillFaceProps {
	card: SmartCard;
	side: 'front' | 'back';
	onPlayAudio?: () => void;
}

export const GapFillFace: React.FC<GapFillFaceProps> = ({ card, side, onPlayAudio }) => {
	const { token } = theme.useToken();
	const t = useTranslations('Study.SmartCube');
	const { front, back } = card;

	// FRONT DESIGN: The Context Challenge
	if (side === 'front') {
		return (
			<Flex
				vertical
				align="center"
				justify="center"
				style={{ height: '100%', position: 'relative', padding: '24px' }}
			>
				{/* Context Sentence */}
				<Title
					level={3}
					style={{
						fontWeight: 400,
						marginBottom: '24px',
						textAlign: 'center',
						color: token.colorTextHeading,
						lineHeight: 1.6,
					}}
				>
					{front.hero}
				</Title>

				{/* Hint */}
				{front.sub && (
					<div
						style={{
							background: token.colorFillAlter,
							padding: '8px 16px',
							borderRadius: '16px',
						}}
					>
						<Text type="secondary" style={{ fontSize: '14px' }}>
							{t('Hint')}: {front.sub}
						</Text>
					</div>
				)}

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

	// BACK DESIGN: The Reveal
	return (
		<Flex vertical style={{ height: '100%', padding: '32px', textAlign: 'left' }}>
			{/* 1. Header: Full Sentence Resolved */}
			<div
				style={{
					background: token.colorSuccessBg,
					padding: '16px',
					borderRadius: '8px',
					marginBottom: '24px',
					borderLeft: `4px solid ${token.colorSuccess}`,
				}}
			>
				<Text style={{ fontSize: '16px', color: token.colorText }}>
					{back.gapFill?.sentence_full || back.answer}
				</Text>
			</div>

			{/* 2. Key Word Details */}
			<Flex justify="space-between" align="flex-start" style={{ marginBottom: '16px' }}>
				<div>
					<Text type="secondary" style={{ fontSize: '14px' }}>
						{back.details.kana}
					</Text>
					<Title level={3} style={{ margin: 0 }}>
						{back.gapFill?.focus_word || card.vocabId}
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
						style={{
							color: token.colorPrimary,
							textTransform: 'uppercase',
							fontSize: '12px',
						}}
					>
						{back.details.han_viet}
					</Text>
				</div>
			</Flex>

			{/* 3. Primary Meaning */}
			<div style={{ marginBottom: 'auto' }}>
				<Text style={{ fontSize: '18px', fontWeight: 500 }}>{back.meanings.join(', ')}</Text>
			</div>

			{/* 4. Mini Etymology (If available) */}
			{back.details.etymology && (
				<div
					style={{
						background: token.colorFillAlter,
						padding: '12px',
						borderRadius: '8px',
						marginTop: '16px',
					}}
				>
					<Flex gap="small" align="center" style={{ marginBottom: '4px' }}>
						<BulbFilled style={{ color: token.colorWarning, fontSize: '12px' }} />
						<Text strong style={{ fontSize: '11px' }}>
							{t('Origin')}
						</Text>
					</Flex>
					<Text style={{ fontSize: '13px', lineHeight: '1.5' }}>
						{back.details.etymology.breakdown}
					</Text>
				</div>
			)}
		</Flex>
	);
};
