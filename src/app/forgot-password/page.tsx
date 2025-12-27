'use client';

import { ambientGradients, customShadows } from '@/lib/theme/themeConfig';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeftOutlined, HomeOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Form, Input, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function ForgotPasswordPage() {
	const { token } = useToken();
	const t = useTranslations('ForgotPassword');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();
	const isDark = token.colorBgBase === '#151F32';

	const handleReset = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const { email } = values as { email: string };

			// Validate origin exists (defensive)
			const origin = typeof window !== 'undefined' ? window.location.origin : '';
			if (!origin) {
				setError(t('errorMessage'));
				setLoading(false);
				return;
			}

			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${origin}/auth/callback?next=/reset-password`,
			});

			if (error) {
				// In production, show user-friendly message; in dev, show technical details
				const isDev = process.env.NODE_ENV === 'development';
				setError(isDev ? error.message : t('errorMessage'));
			} else {
				setMessage(t('successMessage'));
			}
		} catch {
			setError(t('errorMessage'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				minHeight: '100vh',
				background: token.colorBgLayout,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Ambient Background - Match login page style */}
			<div
				style={{
					position: 'absolute',
					top: '-10%',
					right: '-10%',
					width: '60vw',
					height: '60vw',
					background: ambientGradients.primaryBlob,
					filter: 'blur(80px)',
					borderRadius: '50%',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '-10%',
					left: '-10%',
					width: '50vw',
					height: '50vw',
					background: ambientGradients.secondaryBlob(token.colorPrimary),
					filter: 'blur(80px)',
					borderRadius: '50%',
					zIndex: 0,
				}}
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				style={{ zIndex: 1, width: '100%', maxWidth: 420, padding: 24 }}
			>
				<Card
					style={{
						width: '100%',
						background: isDark ? 'rgba(21, 31, 50, 0.75)' : 'rgba(255, 255, 255, 0.85)',
						backdropFilter: 'blur(20px)',
						borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
						boxShadow: isDark ? customShadows.glassCard.dark : customShadows.glassCard.light,
					}}
					styles={{ body: { padding: '40px 32px' } }}
					variant="borderless"
				>
					<div style={{ textAlign: 'center', marginBottom: 32 }}>
						<div style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => router.push('/')}>
							<Image
								src="/assets/w_logo.png"
								alt="Logo"
								width={64}
								height={64}
								style={{ objectFit: 'contain' }}
								suppressHydrationWarning
							/>
						</div>
						<Title
							level={2}
							style={{ color: token.colorPrimary, marginBottom: 8, fontWeight: 800 }}
						>
							{t('title')}
						</Title>
						<Text type="secondary" style={{ fontSize: 16 }}>
							{t('subtitle')}
						</Text>
					</div>

					{error && (
						<Alert
							message={error}
							type="error"
							showIcon
							style={{ marginBottom: 24, borderRadius: 12 }}
						/>
					)}
					{message && (
						<Alert
							message={message}
							type="success"
							showIcon
							style={{ marginBottom: 24, borderRadius: 12 }}
						/>
					)}

					<Form
						name="forgot-password"
						onFinish={handleReset}
						layout="vertical"
						size="large"
						validateTrigger="onBlur"
					>
						<Form.Item
							name="email"
							rules={[
								{ required: true, message: t('emailRequired') },
								{ type: 'email', message: t('emailInvalid') },
							]}
						>
							<Input
								prefix={<MailOutlined style={{ color: token.colorTextTertiary }} />}
								placeholder={t('emailLabel')}
								style={{ borderRadius: 12 }}
								suppressHydrationWarning
							/>
						</Form.Item>

						<Form.Item style={{ marginBottom: 16 }}>
							<Button
								type="primary"
								htmlType="submit"
								style={{
									width: '100%',
									height: 48,
									borderRadius: 12,
									fontWeight: 'bold',
									fontSize: 16,
									boxShadow: `0 8px 20px -6px ${token.colorPrimary}`,
								}}
								loading={loading}
							>
								{t('sendButton')}
							</Button>
						</Form.Item>

						<div style={{ textAlign: 'center', marginTop: 16 }}>
							<Button
								type="link"
								icon={<ArrowLeftOutlined />}
								onClick={() => router.push('/login')}
								style={{ color: token.colorPrimary, fontWeight: 500 }}
							>
								{t('backToLogin')}
							</Button>
							<Text type="secondary" style={{ margin: '0 8px' }}>
								|
							</Text>
							<Button
								type="link"
								icon={<HomeOutlined />}
								onClick={() => router.push('/')}
								style={{ color: token.colorPrimary, fontWeight: 500 }}
							/>
						</div>
					</Form>
				</Card>
			</motion.div>
		</Flex>
	);
}
