'use client';

import VoiceSettings from '@/components/Audio/VoiceSettings';
import { useUserGoals } from '@/modules/user/hooks/useUserGoals';
import { SettingOutlined } from '@ant-design/icons';
import type { User } from '@prisma/client';
import {
	Button,
	Collapse,
	Divider,
	Flex,
	Form,
	InputNumber,
	Radio,
	Select,
	Switch,
	Typography,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface AdvancedSettingsProps {
	userSettings: Partial<User> | null;
	onSettingsChange: () => void;
}

export function AdvancedSettings({ userSettings, onSettingsChange }: AdvancedSettingsProps) {
	const t = useTranslations('Settings');
	const tCommon = useTranslations('Common');
	const { token } = useToken();
	const [form] = Form.useForm();
	const { updateGoals, loading } = useUserGoals();
	const [localTimeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

	useEffect(() => {
		if (userSettings) {
			// Access preferences from JSONB field
			const preferences = (userSettings.preferences as Record<string, unknown>) || {};

			form.setFieldsValue({
				limitNewCards: userSettings.limitNewCards,
				limitReviews: userSettings.limitReviews,
				timezone: userSettings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
				// Access autoShowAnswer from preferences JSONB
				autoShowAnswer: (preferences.autoShowAnswer as boolean) ?? false,
				autoShowAnswerDelay: (preferences.autoShowAnswerDelay as number) ?? 10,
			});
		} else {
			// Set defaults when no userSettings
			form.setFieldsValue({
				autoShowAnswer: false,
				autoShowAnswerDelay: 10,
			});
		}
	}, [userSettings, form]);

	const handleSaveSettings = async () => {
		const values = await form.validateFields();

		// Extract autoShowAnswer fields and move them to preferences
		const { autoShowAnswer, autoShowAnswerDelay, ...directSettings } = values;

		// Merge with existing preferences
		const existingPreferences = (userSettings?.preferences as Record<string, unknown>) || {};
		const updatedPreferences = {
			...existingPreferences,
			...(autoShowAnswer !== undefined && { autoShowAnswer }),
			...(autoShowAnswerDelay !== undefined && { autoShowAnswerDelay }),
		};

		// Update with preferences nested
		const success = await updateGoals({
			...directSettings,
			preferences: updatedPreferences,
		});

		if (success && onSettingsChange) onSettingsChange();
	};

	const items = [
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

	return <Collapse ghost expandIconPlacement="end" items={items} />;
}
