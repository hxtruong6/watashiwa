'use client';

import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
	SoundOutlined,
	TranslationOutlined,
	FontSizeOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { updateUserSettings } from '@/services/actions';

const { Text } = Typography;
const { Panel } = Collapse;

import type { User } from '@/generated/prisma';

// ...

interface VocabSettingsProps {
	showFurigana: boolean;
	setShowFurigana: (show: boolean) => void;
	showRomaji: boolean;
	setShowRomaji: (show: boolean) => void;
	autoPlayAudio: boolean;
	setAutoPlayAudio: (play: boolean) => void;
	// New props for persistence
	userSettings?: Partial<User> | null;
	onSettingsChange?: () => void;
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
				message.success('Settings saved!');
				if (onSettingsChange) onSettingsChange();
			} else {
				message.error(result.error || 'Failed to save settings');
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
					<Tooltip title="Show Furigana (Reading)">
						<FontSizeOutlined style={{ color: '#1890ff' }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>Furigana</Text>
					<Switch size="small" checked={showFurigana} onChange={setShowFurigana} />
				</Flex>

				<Flex align="center" gap="small">
					<Tooltip title="Show Romaji">
						<TranslationOutlined style={{ color: '#52c41a' }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>Romaji</Text>
					<Switch size="small" checked={showRomaji} onChange={setShowRomaji} />
				</Flex>

				<Flex align="center" gap="small">
					<Tooltip title="Auto-play Audio">
						<SoundOutlined style={{ color: '#faad14' }} />
					</Tooltip>
					<Text style={{ fontSize: 13 }}>Auto-play</Text>
					<Switch size="small" checked={autoPlayAudio} onChange={setAutoPlayAudio} />
				</Flex>
			</Flex>

			<div style={{ marginTop: 12, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
				<Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
					Guide:
				</Text>
				<ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: '#666' }}>
					<li>
						<Text strong>[Space]</Text>: Flip / Rate Good
					</li>
					<li>
						<Text strong>[1-4]</Text>: Rate Answer
					</li>
				</ul>
			</div>

			<Collapse ghost expandIconPosition="end">
				<Panel
					header={
						<span style={{ fontWeight: 600, color: '#1E3A5F' }}>
							<SettingOutlined /> Advanced Rules & Limits
						</span>
					}
					key="1"
				>
					<Form form={form} layout="vertical" onFinish={handleSaveSettings}>
						<Flex gap="middle">
							<Form.Item name="limitNewCards" label="New Cards / Day" style={{ flex: 1 }}>
								<InputNumber min={0} max={100} style={{ width: '100%' }} />
							</Form.Item>
							<Form.Item name="limitReviews" label="Reviews / Day" style={{ flex: 1 }}>
								<InputNumber min={0} max={1000} style={{ width: '100%' }} />
							</Form.Item>
						</Flex>

						<Form.Item
							name="timezone"
							label="Timezone"
							help="Daily limits reset at midnight in this timezone."
						>
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

						<Form.Item name="allowSpaceKey" valuePropName="checked" label="Space Key Behavior">
							<Flex gap="small" align="center">
								<Switch />
								<Text>Enable Space Key</Text>
							</Flex>
						</Form.Item>
						<Form.Item
							noStyle
							shouldUpdate={(prev, curr) => prev.allowSpaceKey !== curr.allowSpaceKey}
						>
							{({ getFieldValue }) =>
								getFieldValue('allowSpaceKey') && (
									<Form.Item name="spaceKeyRating" label="Rate as">
										<Radio.Group>
											<Radio value={1}>Again</Radio>
											<Radio value={2}>Hard</Radio>
											<Radio value={3}>Good</Radio>
											<Radio value={4}>Easy</Radio>
										</Radio.Group>
									</Form.Item>
								)
							}
						</Form.Item>

						<Flex gap="middle" align="center">
							<Form.Item name="autoShowAnswer" valuePropName="checked" style={{ marginBottom: 0 }}>
								<Flex gap="small" align="center">
									<Switch />
									<Text>Auto-Show Answer</Text>
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
											label="Delay (seconds)"
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
							Save Settings
						</Button>
					</Form>
				</Panel>
			</Collapse>
		</Card>
	);
}
