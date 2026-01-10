'use client';

import NotificationManager from '@/components/PWA/NotificationManager';
import EmailVerificationButton from '@/modules/email/components/EmailVerificationButton';
import ImageUploader from '@/modules/shared/components/ImageUploader';
import LanguageSelector from '@/modules/user/components/LanguageSelector';
import { useUserGoals } from '@/modules/user/hooks/useUserGoals';
import { updateUserAvatar } from '@/modules/user/user.actions';
import { GlobalOutlined, RocketOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import {
	Button,
	Divider,
	Flex,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Tabs,
	Typography,
	message,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';

const { Text } = Typography;

interface SettingsModalProps {
	open: boolean;
	onCancel: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	user: any; // Using any for simplicity as User type is loose in NavBar
}

const { useToken } = theme;

export default function SettingsModal({ open, onCancel, user }: SettingsModalProps) {
	const { token } = useToken();
	const t = useTranslations('Settings');
	const tCommon = useTranslations('Common');
	const [loading, setLoading] = useState(false);

	const handleAvatarChange = async (url: string | null) => {
		if (!url) return;
		setLoading(true);
		try {
			const res = await updateUserAvatar(url);
			if (res.success) {
				message.success(tCommon('saveSuccess'));
			} else {
				message.error(tCommon('saveError'));
			}
		} catch (error) {
			console.error(error);
			message.error(tCommon('error'));
		} finally {
			setLoading(false);
		}
	};

	const GeneralTab = () => {
		const { theme, setTheme } = useTheme();

		return (
			<Flex vertical gap="large" style={{ padding: '24px 0' }}>
				<div
					style={{
						padding: 16,
						background: token.colorFillQuaternary,
						borderRadius: 12,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
				>
					<Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
						{t('appearance')}
					</Typography.Title>
					<Flex justify="space-between" align="center">
						<Text>{t('theme')}</Text>
						<Select
							value={theme}
							onChange={(value) => setTheme(value)}
							options={[
								{ value: 'light', label: t('light') },
								{ value: 'dark', label: t('dark') },
								{ value: 'system', label: t('system') },
							]}
							style={{ width: 120 }}
						/>
					</Flex>

					<Divider style={{ margin: '16px 0' }} />

					<Flex justify="space-between" align="center">
						<Text>{tCommon('language') || 'Language'}</Text>
						<LanguageSelector />
					</Flex>
				</div>

				<div
					style={{
						padding: 16,
						background: token.colorFillQuaternary,
						borderRadius: 12,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
				>
					<Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
						{t('notifications')}
					</Typography.Title>
					<Flex justify="space-between" align="center">
						<Text>{t('reminders')}</Text>
						<NotificationManager />
					</Flex>
				</div>
			</Flex>
		);
	};

	const GoalsTab = () => {
		const [form] = Form.useForm();
		const { updateGoals, loading } = useUserGoals();

		// Initialize form when component mounts
		React.useEffect(() => {
			if (user) {
				form.setFieldsValue({
					limitNewCards: user.limitNewCards ?? 5,
					limitReviews: user.limitReviews ?? 20,
				});
			}
		}, [form]);

		const handleSaveSettings = async () => {
			const values = await form.validateFields();
			await updateGoals(values);
		};

		return (
			<Form form={form} layout="vertical" onFinish={handleSaveSettings} style={{ paddingTop: 16 }}>
				<Flex vertical gap="middle">
					<div
						style={{
							padding: 16,
							background: token.colorFillQuaternary,
							borderRadius: 12,
							border: `1px solid ${token.colorBorderSecondary}`,
						}}
					>
						<Typography.Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
							{t('studyGoals')}
						</Typography.Title>
						<Flex gap="middle">
							<Form.Item
								name="limitNewCards"
								label={t('limitNewCards')}
								style={{ flex: 1, marginBottom: 0 }}
								tooltip={t('limitNewCardsTooltip')}
							>
								<InputNumber min={0} max={100} style={{ width: '100%' }} />
							</Form.Item>
							<Form.Item
								name="limitReviews"
								label={t('limitReviews')}
								style={{ flex: 1, marginBottom: 0 }}
								tooltip={t('limitReviewsTooltip')}
							>
								<InputNumber min={0} max={500} style={{ width: '100%' }} />
							</Form.Item>
						</Flex>
					</div>
					<Button type="primary" htmlType="submit" loading={loading} block>
						{tCommon('save')}
					</Button>
				</Flex>
			</Form>
		);
	};

	const renderProfileTab = () => (
		<Flex vertical gap="large" align="center" style={{ padding: '24px 0' }}>
			<Flex vertical align="center" gap="small">
				<ImageUploader
					purpose="avatar"
					shape="circle"
					value={user?.user_metadata?.avatar_url || user?.avatarUrl}
					onChange={handleAvatarChange}
					height={100}
					width={100}
				/>
				<Text type="secondary">{t('uploadAvatar')}</Text>
			</Flex>

			<Divider style={{ margin: 0 }} />

			<Form layout="vertical" style={{ width: '100%' }}>
				<Form.Item label={tCommon('email')}>
					<Input value={user?.email} disabled style={{ color: token.colorText }} />
				</Form.Item>
				<Form.Item label={tCommon('name')}>
					<Input
						value={user?.user_metadata?.full_name || user?.name}
						disabled
						style={{ color: token.colorText }}
					/>
				</Form.Item>
			</Form>

			<Divider style={{ margin: '16px 0' }} />

			<div style={{ width: '100%' }}>
				<EmailVerificationButton userEmail={user?.email || ''} />
			</div>
		</Flex>
	);

	const items = [
		{
			key: 'general',
			label: (
				<span>
					<GlobalOutlined /> {t('general')}
				</span>
			),
			children: <GeneralTab />,
		},
		{
			key: 'profile',
			label: (
				<span>
					<UserOutlined /> {t('profile')}
				</span>
			),
			children: renderProfileTab(),
		},
		{
			key: 'goals',
			label: (
				<span>
					<RocketOutlined /> {t('goals')}
				</span>
			),
			children: <GoalsTab />,
		},
	];

	return (
		<Modal
			title={
				<span>
					<SettingOutlined style={{ marginRight: 8 }} />
					{t('settings')}
				</span>
			}
			open={open}
			onCancel={onCancel}
			footer={null} // Custom footer via form inside tabs
			width={480}
			styles={{
				header: {
					marginBottom: 0,
				},
			}}
		>
			<Tabs defaultActiveKey="profile" items={items} />
		</Modal>
	);
}
