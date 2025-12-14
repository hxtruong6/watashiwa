import React, { useEffect, useState } from 'react';
import { Select, Slider, Typography, Form, Space, Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useAudioPlayer } from './useAudioPlayer';

const { Text } = Typography;

interface VoiceSettingsProps {
	lang?: string;
	onSettingsChange?: (settings: { voiceUri: string; speed: number }) => void;
}

const STORAGE_KEY_VOICE = 'watashiwa_audio_voice';
const STORAGE_KEY_SPEED = 'watashiwa_audio_speed';

export default function VoiceSettings({ lang = 'ja-JP', onSettingsChange }: VoiceSettingsProps) {
	const [speed, setSpeed] = useState(() => {
		if (typeof window === 'undefined') return 1;
		const s = localStorage.getItem(STORAGE_KEY_SPEED);
		return s ? parseFloat(s) : 1;
	});

	const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(() => {
		if (typeof window === 'undefined') return '';
		return localStorage.getItem(STORAGE_KEY_VOICE) || '';
	});

	const { voices, speak } = useAudioPlayer({ lang, rate: speed, voiceUri: selectedVoiceUri });

	// Notify parent on mount if needed, but safer to do it in effect ONLY if values exist
	useEffect(() => {
		if (onSettingsChange && (selectedVoiceUri || speed !== 1)) {
			onSettingsChange({
				voiceUri: selectedVoiceUri,
				speed,
			});
		}
	}, [onSettingsChange, selectedVoiceUri, speed]); // Run once to sync if needed

	// Filter voices for the target language or "smart" defaults
	const jpVoices = voices.filter((v) => v.lang === 'ja-JP');

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
				<Form.Item label="Voice (Japanese)">
					<Space.Compact style={{ width: '100%' }}>
						<Select
							value={selectedVoiceUri}
							onChange={handleVoiceChange}
							placeholder="Select a voice"
							style={{ flex: 1 }}
						>
							{jpVoices.length === 0 && (
								<Select.Option value="" disabled>
									No Japanese voices found
								</Select.Option>
							)}
							{jpVoices.map((v) => (
								<Select.Option key={v.voiceURI} value={v.voiceURI}>
									{v.name}
								</Select.Option>
							))}
						</Select>
						<Button icon={<PlayCircleOutlined />} onClick={testAudio}>
							Test
						</Button>
					</Space.Compact>
					{jpVoices.length === 0 && (
						<Text type="secondary" style={{ fontSize: 12 }}>
							Depending on your browser/OS, you might need to install Japanese language pack.
						</Text>
					)}
				</Form.Item>

				<Form.Item label={`Playback Speed: ${speed}x`}>
					<Slider
						min={0.5}
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
