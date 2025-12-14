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
const { Panel } = Collapse;

import type { User } from '@/generated/prisma';

// ...

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
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	// Update form when userSettings prop changes
	useEffect(() => {
		if (userSettings) {
			form.setFieldsValue({
				limitNewCards: userSettings.limitNewCards,
				limitReviews: userSettings.limitReviews,
				allowSpaceKey: userSettings.allowSpaceKey,
				spaceKeyRating: userSettings.spaceKeyRating,
				autoShowAnswer: userSettings.autoShowAnswer,
				autoShowAnswerDelay: userSettings.autoShowAnswerDelay,
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
						<FontSizeOutlined style={{ color: '#1890ff' }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>{t('furigana')}</Text>
					<Switch size="small" checked={showFurigana} onChange={setShowFurigana} />
				</Flex>

				<Flex align="center" gap="small">
					<Tooltip title={t('romajiTooltip')}>
						<TranslationOutlined style={{ color: '#52c41a' }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>{t('romaji')}</Text>
					<Switch size="small" checked={showRomaji} onChange={setShowRomaji} />
				</Flex>

				<Flex align="center" gap="small" wrap="wrap">
					<Tooltip title={t('autoPlayTooltip')}>
						<SoundOutlined style={{ color: '#faad14' }} />
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

			<div style={{ marginTop: 12, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
				<Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
					{t('guideTitle')}
				</Text>
				<ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: '#666' }}>
					<li>
						<Text strong>[Space]</Text>: {t('guideSpace')}
					</li>
					<li>
						<Text strong>[1-4]</Text>: {t('guideNumbers')}
					</li>
					<li>
						<Text strong>Mobile</Text>: {t('guideMobile')}
					</li>
				</ul>
			</div>

			<Collapse ghost expandIconPlacement="end">
				<Panel
					header={
						<span style={{ fontWeight: 600, color: '#1E3A5F' }}>
							<SettingOutlined /> {t('advancedSettings')}
						</span>
					}
					key="1"
				>
					<div style={{ marginBottom: 24, padding: '0 8px' }}>
						<Text strong style={{ color: '#1E3A5F' }}>
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
										value: Intl.DateTimeFormat().resolvedOptions().timeZone,
										label: `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
									},
								]}
							/>
						</Form.Item>

						<Form.Item name="allowSpaceKey" valuePropName="checked" label={t('allowSpaceKeyLabel')}>
							<Flex gap="small" align="center">
								<Switch />
								<Text>{t('allowSpaceKey')}</Text>
							</Flex>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev, curr) => prev.allowSpaceKey !== curr.allowSpaceKey}
						>
							{({ getFieldValue }) =>
								getFieldValue('allowSpaceKey') && (
									<Form.Item name="spaceKeyRating" label={t('spaceKeyRating')}>
										<Radio.Group>
											<Radio value={1}>{tCommon('rateAgain') || 'Again'}</Radio>
											<Radio value={2}>{tCommon('rateHard') || 'Hard'}</Radio>
											<Radio value={3}>{tCommon('rateGood') || 'Good'}</Radio>
											<Radio value={4}>{tCommon('rateEasy') || 'Easy'}</Radio>
										</Radio.Group>
									</Form.Item>
								)
							}
						</Form.Item>

						<Flex gap="middle" align="center">
							<Form.Item name="autoShowAnswer" valuePropName="checked" style={{ marginBottom: 0 }}>
								<Flex gap="small" align="center">
									<Switch />
									<Text>{t('autoShowAnswer')}</Text>
								</Flex>
							</Form.Item>
							<Form.Item
								noStyle
								shouldUpdate={(prev, curr) => prev.autoShowAnswer !== curr.autoShowAnswer}
							>
								{({ getFieldValue }) =>
									getFieldValue('autoShowAnswer') && (
										<Form.Item
											name="autoShowAnswerDelay"
											label={t('autoShowAnswerDelay')}
											style={{ marginBottom: 0, width: 140 }}
										>
											<InputNumber
												addonAfter="sec"
												min={1}
												max={300}
												placeholder="Delay"
												style={{ width: '100%' }}
											/>
										</Form.Item>
									)
								}
							</Form.Item>
						</Flex>

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
				</Panel>
			</Collapse>
		</Card>
	);
}
