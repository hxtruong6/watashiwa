'use client';

import { getUser } from '@/modules/auth/auth.actions';
import { getUserSettings } from '@/modules/user/user.actions';
import { updateUserSettings } from '@/modules/user/user.actions';
import { Button, Card, Flex, Form, Select, Spin, Typography, message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function ProfileSetupPage() {
	const { token } = useToken();
	const t = useTranslations('Profile');
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [checking, setChecking] = useState(true);
	const [form] = Form.useForm();

	// Check authentication and setup status - redirect if not authenticated or already set up
	useEffect(() => {
		const checkAuthAndSetupStatus = async () => {
			try {
				// First check if user is authenticated
				const user = await getUser();
				if (!user) {
					// Not authenticated - redirect to login
					router.push('/login');
					return;
				}

				// Check if user has already completed setup
				const settings = await getUserSettings();
				// If user has language settings, they've completed setup
				if (settings?.language) {
					// Redirect existing users to dashboard
					router.push('/');
					return;
				}
			} catch (error) {
				console.error('Failed to check auth/setup status:', error);
				// On error, redirect to login for safety
				router.push('/login');
			} finally {
				setChecking(false);
			}
		};

		checkAuthAndSetupStatus();
	}, [router]);

	const handleFinish = async (values: { language?: 'en' | 'vi' | 'ja' }) => {
		setLoading(true);
		try {
			const result = await updateUserSettings({
				language: values.language || 'vi', // Default to Vietnamese
			});

			if (result.success) {
				message.success(t('setupSuccess') || 'Profile setup complete!');
				// Redirect to dashboard after setup
				router.push('/');
			} else {
				message.error(result.error || t('setupError') || 'Failed to save profile');
			}
		} catch (error) {
			console.error('Profile setup error:', error);
			message.error(t('setupError') || 'Failed to save profile');
		} finally {
			setLoading(false);
		}
	};

	// Show loading while checking setup status
	if (checking) {
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
					<Flex vertical justify="center" align="center" style={{ padding: '40px 0' }} gap="middle">
						<Spin size="large" />
						<Text type="secondary">Checking setup status...</Text>
					</Flex>
				</Card>
			</Flex>
		);
	}

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
								{ value: 'ja', label: '🇯🇵 日本語' },
							]}
							style={{ width: '100%' }}
						/>
					</Form.Item>

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
