'use client';

import React from 'react';
import { Card, Switch, Flex, Typography, Tooltip } from 'antd';
import { SoundOutlined, TranslationOutlined, FontSizeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface VocabSettingsProps {
	showFurigana: boolean;
	setShowFurigana: (show: boolean) => void;
	showRomaji: boolean;
	setShowRomaji: (show: boolean) => void;
	autoPlayAudio: boolean;
	setAutoPlayAudio: (play: boolean) => void;
}

export default function VocabSettings({
	showFurigana,
	setShowFurigana,
	showRomaji,
	setShowRomaji,
	autoPlayAudio,
	setAutoPlayAudio,
}: VocabSettingsProps) {
	return (
		<Card
			size="small"
			style={{
				width: '100%',
				maxWidth: 600,
				margin: '0 auto 16px',
				borderRadius: 12,
				boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
			}}
		>
			<Flex gap="middle" wrap="wrap" justify="center" align="center">
				<Flex align="center" gap="small">
					<Tooltip title="Show Furigana (Reading)">
						<FontSizeOutlined style={{ color: '#1890ff' }} />
					</Tooltip>
					<Text style={{ fontSize: 14 }}>Furigana</Text>
					<Switch size="small" checked={showFurigana} onChange={setShowFurigana} />
				</Flex>

				<Flex align="center" gap="small">
					<Tooltip title="Show Romaji">
						<TranslationOutlined style={{ color: '#52c41a' }} />
					</Tooltip>
					<Text style={{ fontSize: 14 }}>Romaji</Text>
					<Switch size="small" checked={showRomaji} onChange={setShowRomaji} />
				</Flex>

				<Flex align="center" gap="small">
					<Tooltip title="Auto-play Audio">
						<SoundOutlined style={{ color: '#faad14' }} />
					</Tooltip>
					<Text style={{ fontSize: 14 }}>Auto-play</Text>
					<Switch size="small" checked={autoPlayAudio} onChange={setAutoPlayAudio} />
				</Flex>
			</Flex>

			<div style={{ marginTop: 24, padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
				<Text strong style={{ display: 'block', marginBottom: 8 }}>
					Guide & Shortcuts:
				</Text>
				<ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#666' }}>
					<li style={{ marginBottom: 4 }}>
						<Text strong>[Space]</Text>: Show Answer
					</li>
					<li style={{ marginBottom: 4 }}>
						<Text strong>[1, 2, 3, 4]</Text>: Rate (Again, Hard, Good, Easy)
					</li>
					<li style={{ marginBottom: 4 }}>
						<Text strong>Mobile</Text>: Tap buttons to rate. Header hides on scroll down, shows on
						scroll up.
					</li>
				</ul>
			</div>
		</Card>
	);
}
