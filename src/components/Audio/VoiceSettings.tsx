import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, Form, Select, Slider, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { useAudioPlayer } from './useAudioPlayer';
import { DEFAULT_TTS_SPEED, STORAGE_KEY_SPEED, STORAGE_KEY_VOICE } from './useTtsSettings';
import { getSelectableVoices, resolveJapaneseVoice } from './voiceUtils';

const { Text } = Typography;

interface VoiceSettingsProps {
	lang?: string;
	onSettingsChange?: (settings: { voiceUri: string; speed: number }) => void;
}

export default function VoiceSettings({ lang = 'ja-JP', onSettingsChange }: VoiceSettingsProps) {
	const t = useTranslations('Settings');
	const [speed, setSpeed] = useState(() => {
		if (typeof window === 'undefined') return DEFAULT_TTS_SPEED;
		const s = localStorage.getItem(STORAGE_KEY_SPEED);
		return s ? parseFloat(s) : DEFAULT_TTS_SPEED;
	});

	const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(() => {
		if (typeof window === 'undefined') return '';
		return localStorage.getItem(STORAGE_KEY_VOICE) || '';
	});

	const { voices, speak } = useAudioPlayer({
		lang,
		rate: speed,
		voiceUri: selectedVoiceUri || undefined,
	});

	// Notify parent on mount if needed, but safer to do it in effect ONLY if values exist
	useEffect(() => {
		if (onSettingsChange && (selectedVoiceUri || speed !== DEFAULT_TTS_SPEED)) {
			onSettingsChange({
				voiceUri: selectedVoiceUri,
				speed,
			});
		}
	}, [onSettingsChange, selectedVoiceUri, speed]);

	// Same source as useAudioPlayer: only show preferred voices (Hattori, Kyoko) in settings
	const jpVoices = getSelectableVoices(voices);
	const defaultVoice = resolveJapaneseVoice(voices, null);
	const defaultVoiceUri = defaultVoice?.voiceURI ?? '';
	const defaultIsInList = jpVoices.some((v) => v.voiceURI === defaultVoiceUri);
	const effectiveVoiceUri = selectedVoiceUri || (defaultIsInList ? defaultVoiceUri : '');

	const handleVoiceChange = (val: string) => {
		setSelectedVoiceUri(val);
		localStorage.setItem(STORAGE_KEY_VOICE, val);
		if (onSettingsChange) onSettingsChange({ voiceUri: val, speed });
	};

	const handleSpeedChange = (val: number) => {
		setSpeed(val);
		localStorage.setItem(STORAGE_KEY_SPEED, String(val));
		if (onSettingsChange) onSettingsChange({ voiceUri: selectedVoiceUri, speed: val });
	};

	const testAudio = () => {
		speak('こんにちは、これはテストです。'); // "Hello, this is a test."
	};

	return (
		<div style={{ marginTop: 16 }}>
			<Form layout="vertical">
				<Form.Item label={t('voiceLabel')}>
					<Space.Compact style={{ width: '100%' }}>
						<Select
							value={effectiveVoiceUri}
							onChange={handleVoiceChange}
							placeholder={t('voicePlaceholder')}
							style={{ flex: 1 }}
						>
							{jpVoices.length === 0 && (
								<Select.Option value="" disabled>
									{t('voiceNoFound')}
								</Select.Option>
							)}
							{jpVoices.map((v) => (
								<Select.Option key={v.voiceURI} value={v.voiceURI}>
									{v.name}
								</Select.Option>
							))}
						</Select>
						<Button icon={<PlayCircleOutlined />} onClick={testAudio}>
							{t('voiceTest')}
						</Button>
					</Space.Compact>
					{jpVoices.length === 0 && (
						<Text type="secondary" style={{ fontSize: 12 }}>
							{t('voiceWarning')}
						</Text>
					)}
				</Form.Item>

				<Form.Item label={t('playbackSpeed', { speed })}>
					<Slider
						min={0.2}
						max={2.0}
						step={0.1}
						value={speed}
						onChange={handleSpeedChange}
						tooltip={{ formatter: (value) => `${value}x` }}
					/>
				</Form.Item>
			</Form>
		</div>
	);
}
