'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Flex,
	Form,
	Segmented,
	Select,
	Tooltip,
	Typography,
	message,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

interface ProfileSetupFormProps {
	returnUrl?: string | null;
}

export default function ProfileSetupForm({ returnUrl }: ProfileSetupFormProps) {
	const { token } = useToken();
	const t = useTranslations('Profile');
	const tStudy = useTranslations('Study');
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form] = Form.useForm();

	const handleFinish = async (values: {
		language?: 'en' | 'vi';
		algorithmMode?: 'semantic' | 'srs';
	}) => {
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
					algorithmMode: values.algorithmMode || 'srs', // Default to SRS
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
					initialValues={{ language: 'vi', algorithmMode: 'srs' }}
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

					<Form.Item
						name="algorithmMode"
						label={
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<Text>{t('learningMethod') || 'Learning Method'}</Text>
								<Tooltip
									title={
										<div style={{ maxWidth: 300 }}>
											<Text strong>{tStudy('algorithmModeSemantic')} (CUBE):</Text>{' '}
											{t('cubeMethodTooltip') ||
												'Our innovative method that groups related words together based on semantic connections, etymology, and context for deeper understanding.'}
											<br />
											<br />
											<Text strong>{tStudy('algorithmModeSRS')}:</Text>{' '}
											{t('srsMethodTooltip') ||
												'Traditional spaced repetition system that prioritizes due reviews and new cards based on optimal timing.'}
										</div>
									}
								>
									<InfoCircleOutlined style={{ color: token.colorTextSecondary, cursor: 'help' }} />
								</Tooltip>
							</div>
						}
					>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<Segmented
								options={[
									{
										label: `${tStudy('algorithmModeSemantic')} (CUBE)`,
										value: 'semantic',
									},
									{ label: tStudy('algorithmModeSRS'), value: 'srs' },
								]}
								size="large"
								block
							/>
							<Button
								type="link"
								size="small"
								onClick={() => router.push('/profile/setup/cube')}
								style={{ padding: 0, height: 'auto', fontSize: 12, textAlign: 'left' }}
							>
								{t('learnMoreAboutCube') || 'Learn more about CUBE method →'}
							</Button>
						</div>
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
