'use client';

import React, { useState } from 'react';
import {
	Modal,
	Form,
	Input,
	Button,
	message,
	Tabs,
	Typography,
	Flex,
	Divider,
	InputNumber,
	theme,
} from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';

import ImageUploader from '@/components/Shared/ImageUploader';
import { updateUserAvatar, updateUserSettings } from '@/services/actions';
import { useTranslations } from 'next-intl';

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
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	// Initialize form when modal opens
	React.useEffect(() => {
		if (open && user) {
			form.setFieldsValue({
				limitNewCards: user.limitNewCards ?? 5,
				limitReviews: user.limitReviews ?? 20,
			});
		}
	}, [open, user, form]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleAvatarChange = async (url: string | null) => {
		if (!url) return;
		setLoading(true);
		try {
			const res = await updateUserAvatar(url);
			if (res.success) {
				message.success(tCommon('saveSuccess') || 'Avatar updated successfully');
			} else {
				message.error(tCommon('saveError') || 'Failed to update avatar');
			}
		} catch (error) {
			console.error(error);
			message.error(tCommon('error') || 'Error updating avatar');
		} finally {
			setLoading(false);
		}
	};

	const handleSaveSettings = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);
			const result = await updateUserSettings(values);
			if (result.success) {
				message.success(tCommon('saveSuccess'));
				// Optionally refresh router or just rely on state update if upstream handles it
			} else {
				message.error(result.error || tCommon('saveError'));
			}
		} catch (error) {
			console.error('Save failed:', error);
		} finally {
			setLoading(false);
		}
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
				<Text type="secondary">{t('uploadAvatar') || 'Click to upload new avatar'}</Text>
			</Flex>

			<Divider style={{ margin: 0 }} />

			<Form layout="vertical" style={{ width: '100%' }}>
				<Form.Item label={tCommon('email') || 'Email'}>
					<Input value={user?.email} disabled style={{ color: token.colorText }} />
				</Form.Item>
				<Form.Item label={tCommon('name') || 'Name'}>
					<Input
						value={user?.user_metadata?.full_name || user?.name}
						disabled
						style={{ color: token.colorText }}
					/>
				</Form.Item>
			</Form>
		</Flex>
	);

	const renderGoalsTab = () => (
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
						{t('studyGoals') || 'Study Goals'}
					</Typography.Title>
					<Flex gap="middle">
						<Form.Item
							name="limitNewCards"
							label={t('limitNewCards') || 'New Cards / Day'}
							style={{ flex: 1, marginBottom: 0 }}
							tooltip={t('limitNewCardsTooltip')}
						>
							<InputNumber min={0} max={100} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item
							name="limitReviews"
							label={t('limitReviews') || 'Reviews / Day'}
							style={{ flex: 1, marginBottom: 0 }}
							tooltip={t('limitReviewsTooltip')}
						>
							<InputNumber min={0} max={500} style={{ width: '100%' }} />
						</Form.Item>
					</Flex>
				</div>
				<Button type="primary" htmlType="submit" loading={loading} block>
					{tCommon('save') || 'Save Changes'}
				</Button>
			</Flex>
		</Form>
	);

	const items = [
		{
			key: 'profile',
			label: (
				<span>
					<UserOutlined /> {t('profile') || 'Profile'}
				</span>
			),
			children: renderProfileTab(),
		},
		{
			key: 'goals',
			label: (
				<span>
					<SettingOutlined /> {t('goals') || 'Goals'}
				</span>
			),
			children: renderGoalsTab(),
		},
	];

	return (
		<Modal
			title={
				<span>
					<SettingOutlined style={{ marginRight: 8 }} />
					{t('settings') || 'Settings'}
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
