'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import { Alert, Button, Card, Flex, Form, Select, Typography, message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

interface ProfileSetupFormProps {
	returnUrl?: string | null;
}

export default function ProfileSetupForm({ returnUrl }: ProfileSetupFormProps) {
	const { token } = useToken();
	const t = useTranslations('Profile');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form] = Form.useForm();

	const handleFinish = async (values: { language?: 'en' | 'vi' | 'ja' }) => {
		// Prevent multiple simultaneous submissions
		if (loading) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const result = await updateUserSettings({
				language: values.language || 'vi',
				preferences: {
					setupCompleted: true,
				},
			});

			if (result.success) {
				message.success(t('setupSuccess') || 'Profile setup complete!');

				// Determine redirect path
				// Default to /dashboard for authenticated users (main board)
				const redirectPath = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard';

				// Use window.location.href for full page reload to ensure:
				// 1. Server components see updated setup status (cache invalidation)
				// 2. No race conditions with client-side state
				// 3. Consistent with auth flow patterns in codebase
				//
				// Note: router.push() could work, but window.location.href is safer
				// because it guarantees a fresh server-side render with updated DB state.
				// The slight performance trade-off is acceptable for correctness.
				window.location.href = redirectPath;
			} else {
				const errorMessage = result.error || t('setupError') || 'Failed to save profile';
				setError(errorMessage);
				message.error(errorMessage);
				setLoading(false);
			}
		} catch (error) {
			console.error('Profile setup error:', error);
			const errorMessage = t('setupError') || 'Failed to save profile. Please try again.';
			setError(errorMessage);
			message.error(errorMessage);
			setLoading(false);
		}
	};

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				minHeight: 'calc(100vh - 64px)',
				padding: '24px 16px',
				background: token.colorBgLayout,
			}}
		>
			<Card
				style={{
					width: '100%',
					maxWidth: 500,
					background: token.colorBgContainer,
					boxShadow: token.boxShadow,
				}}
			>
				<div style={{ textAlign: 'center', marginBottom: 32 }}>
					<Title level={2} style={{ color: token.colorPrimary, marginBottom: 8 }}>
						{t('setupTitle') || 'Complete Your Profile'}
					</Title>
					<Text type="secondary">
						{t('setupSubtitle') || 'Set up your preferences to get started'}
					</Text>
				</div>

				<Form
					form={form}
					layout="vertical"
					onFinish={handleFinish}
					initialValues={{ language: 'vi' }}
				>
					<Form.Item
						name="language"
						label={t('languageLabel') || 'Interface Language'}
						rules={[
							{ required: true, message: t('languageRequired') || 'Please select a language' },
						]}
					>
						<Select
							options={[
								{ value: 'vi', label: '🇻🇳 Tiếng Việt' },
								{ value: 'en', label: '🇺🇸 English' },
							]}
							style={{ width: '100%' }}
						/>
					</Form.Item>

					{error && (
						<Form.Item>
							<Alert
								title={t('error') || 'Error'}
								description={error}
								type="error"
								showIcon
								closable
								onClose={() => setError(null)}
							/>
						</Form.Item>
					)}

					<Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
						<Button
							type="primary"
							htmlType="submit"
							block
							loading={loading}
							size="large"
							style={{
								height: 48,
								fontWeight: 'bold',
								fontSize: 16,
							}}
						>
							{t('completeSetup') || 'Complete Setup'}
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</Flex>
	);
}
