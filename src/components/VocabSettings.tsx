'use client';

import React, { useState, useEffect } from 'react';
import VoiceSettings from './Audio/VoiceSettings';
import {
	Card,
	Switch,
	Flex,
	Typography,
	Tooltip,
	Button,
	Form,
	InputNumber,
	Select,
	Radio,
	message,
	Collapse,
	Divider,
	theme,
} from 'antd';
import {
	SoundOutlined,
	TranslationOutlined,
	FontSizeOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { updateUserSettings } from '@/services/actions';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

const { useToken } = theme;

import type { User } from '@/generated/prisma';

interface VocabSettingsProps {
	showFurigana: boolean;
	setShowFurigana: (show: boolean) => void;
	showRomaji: boolean;
	setShowRomaji: (show: boolean) => void;
	autoPlayAudio: 'off' | 'question' | 'answer';
	setAutoPlayAudio: (val: 'off' | 'question' | 'answer') => void;
	// New props for persistence
	userSettings: Partial<User> | null;
	onSettingsChange: () => void;
}

export default function VocabSettings({
	showFurigana,
	setShowFurigana,
	showRomaji,
	setShowRomaji,
	autoPlayAudio,
	setAutoPlayAudio,
	userSettings,
	onSettingsChange,
}: VocabSettingsProps) {
	const t = useTranslations('Settings');
	const tCommon = useTranslations('Common');
	const { token } = useToken();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const [localTimeZone, setLocalTimeZone] = useState('UTC');

	useEffect(() => {
		setLocalTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
	}, []);

	// Update form when userSettings prop changes
	useEffect(() => {
		if (userSettings) {
			form.setFieldsValue({
				limitNewCards: userSettings.limitNewCards,
				limitReviews: userSettings.limitReviews,
				allowSpaceKey: userSettings.allowSpaceKey,
				spaceKeyRating: userSettings.spaceKeyRating,
				autoShowAnswer: userSettings.autoShowAnswer,
				autoShowAnswerDelay: userSettings.autoShowAnswerDelay ?? 10,
				timezone: userSettings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
			});
		}
	}, [userSettings, form]);

	const handleSaveSettings = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);
			const result = await updateUserSettings(values);
			if (result.success) {
				message.success(tCommon('saveSuccess'));
				if (onSettingsChange) onSettingsChange();
			} else {
				message.error(result.error || tCommon('saveError'));
			}
		} catch (error) {
			console.error('Save failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const guideItems = [
		{
			key: '1',
			label: (
				<Text strong style={{ fontSize: 12 }}>
					{t('guideTitle')}
				</Text>
			),
			style: { background: token.colorFillQuaternary, borderRadius: 8 },
			children: (
				<ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: token.colorTextSecondary }}>
					<li>
						<Text strong>[Space]</Text>: {t('guideSpace')}
					</li>
					<li>
						<Text strong>[1-4]</Text>: {t('guideNumbers')}
					</li>
					<li>
						<Text strong>[R]</Text>: {t('guideReplay')}
					</li>
					<li>
						<Text strong>[E]</Text>: {t('guideExample')}
					</li>
					<li>
						<Text strong>Mobile</Text>: {t('guideMobile')}
					</li>
				</ul>
			),
		},
	];

	const advancedSettingsItems = [
		{
			key: '1',
			label: (
				<span style={{ fontWeight: 600, color: token.colorPrimary }}>
					<SettingOutlined /> {t('advancedSettings')}
				</span>
			),
			children: (
				<>
					<div style={{ marginBottom: 24, padding: '0 8px' }}>
						<Text strong style={{ color: token.colorPrimary }}>
							{t('audioSettings')}
						</Text>
						<VoiceSettings />
						<Divider style={{ margin: '16px 0' }} />
					</div>

					<Form form={form} layout="vertical" onFinish={handleSaveSettings}>
						<Flex gap="middle">
							<Form.Item name="limitNewCards" label={t('limitNewCards')} style={{ flex: 1 }}>
								<InputNumber min={0} max={100} style={{ width: '100%' }} />
							</Form.Item>
							<Form.Item name="limitReviews" label={t('limitReviews')} style={{ flex: 1 }}>
								<InputNumber min={0} max={1000} style={{ width: '100%' }} />
							</Form.Item>
						</Flex>

						<Form.Item name="timezone" label={t('timezone')} help={t('timezoneHelp')}>
							<Select
								showSearch
								options={[
									{ value: 'UTC', label: 'UTC' },
									{ value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
									{ value: 'America/New_York', label: 'America/New_York (EST)' },
									{ value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
									{ value: 'Europe/London', label: 'Europe/London (GMT)' },
									{
										value: localTimeZone,
										label: `Local (${localTimeZone})`,
									},
								]}
							/>
						</Form.Item>

						<Form.Item name="spaceKeyRating" label={t('spaceKeyRating')}>
							<Radio.Group>
								<Radio value={1}>{tCommon('rateAgain') || 'Again'}</Radio>
								<Radio value={2}>{tCommon('rateHard') || 'Hard'}</Radio>
								<Radio value={3}>{tCommon('rateGood') || 'Good'}</Radio>
								<Radio value={4}>{tCommon('rateEasy') || 'Easy'}</Radio>
							</Radio.Group>
						</Form.Item>

						<div
							style={{
								marginTop: 8,
								padding: '12px 16px',
								background: token.colorBgLayout,
								borderRadius: 12,
								border: '1px solid rgba(0,0,0,0.04)',
							}}
						>
							<Flex align="center" justify="space-between" wrap="wrap" gap="small">
								<Flex align="center" gap="middle" style={{ flex: 1, minWidth: 140 }}>
									<Form.Item name="autoShowAnswer" valuePropName="checked" noStyle>
										<Switch />
									</Form.Item>
									<Flex vertical gap={0}>
										<Text strong style={{ fontSize: 14, color: token.colorPrimary }}>
											{t('autoShowAnswer')}
										</Text>
									</Flex>
								</Flex>

								<Form.Item
									noStyle
									shouldUpdate={(prev, curr) => prev.autoShowAnswer !== curr.autoShowAnswer}
								>
									{({ getFieldValue }) =>
										getFieldValue('autoShowAnswer') && (
											<Flex align="center" gap="small">
												<Text type="secondary" style={{ fontSize: 12 }}>
													{t('delay') || 'Delay'}:
												</Text>
												<Form.Item name="autoShowAnswerDelay" noStyle>
													<InputNumber min={1} max={300} style={{ width: 70 }} controls={false} />
												</Form.Item>
												<Text type="secondary" style={{ fontSize: 12 }}>
													s
												</Text>
											</Flex>
										)
									}
								</Form.Item>
							</Flex>
						</div>

						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							block
							style={{ marginTop: 16 }}
						>
							{t('saveSettings')}
						</Button>
					</Form>
				</>
			),
		},
	];

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
			<Flex
				gap="middle"
				wrap="wrap"
				justify="space-between"
				align="center"
				style={{ marginBottom: 16 }}
			>
				<Flex align="center" gap="small">
					<Tooltip title={t('furiganaTooltip')}>
						<FontSizeOutlined style={{ color: token.colorPrimary }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>{t('furigana')}</Text>
					<Switch size="small" checked={showFurigana} onChange={setShowFurigana} />
				</Flex>

				<Flex align="center" gap="small">
					<Tooltip title={t('romajiTooltip')}>
						<TranslationOutlined style={{ color: token.colorSuccess }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>{t('romaji')}</Text>
					<Switch size="small" checked={showRomaji} onChange={setShowRomaji} />
				</Flex>

				<Flex align="center" gap="small" wrap="wrap">
					<Tooltip title={t('autoPlayTooltip')}>
						<SoundOutlined style={{ color: token.colorWarning }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>{t('autoPlay')}</Text>
					<Radio.Group
						value={autoPlayAudio}
						onChange={(e) => setAutoPlayAudio(e.target.value as 'off' | 'question' | 'answer')}
						size="small"
					>
						<Radio.Button value="off">{tCommon('off')}</Radio.Button>
						<Radio.Button value="question">{t('question')}</Radio.Button>
						<Radio.Button value="answer">{t('answer')}</Radio.Button>
					</Radio.Group>
				</Flex>
			</Flex>

			<div style={{ marginTop: 12, marginBottom: 16 }}>
				<Collapse ghost size="small" items={guideItems} />
			</div>

			<Collapse ghost expandIconPlacement="end" items={advancedSettingsItems} />
		</Card>
	);
}
