'use client';

import { ambientGradients, customShadows } from '@/lib/theme/themeConfig';
import { createClient } from '@/utils/supabase/client';
import { HomeOutlined, LockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Form, Input, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function ResetPasswordPage() {
	const { token } = useToken();
	const t = useTranslations('ResetPassword');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [checkingSession, setCheckingSession] = useState(true);
	const router = useRouter();
	const supabase = createClient();
	const isDark = token.colorBgBase === '#151F32';

	// Check if user has valid reset token (session from email link)
	useEffect(() => {
		const checkSession = async () => {
			try {
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				// If no session or error, user doesn't have valid reset token
				if (!session || sessionError) {
					setError(t('noSession'));
					setTimeout(() => {
						router.push('/forgot-password');
					}, 3000);
				}
			} catch {
				setError(t('invalidToken'));
				setTimeout(() => {
					router.push('/forgot-password');
				}, 3000);
			} finally {
				setCheckingSession(false);
			}
		};

		checkSession();
	}, [supabase, router, t]);

	const handleUpdate = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const { password } = values as { password: string };

			// Double-check session before updating
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setError(t('noSession'));
				setLoading(false);
				setTimeout(() => {
					router.push('/forgot-password');
				}, 3000);
				return;
			}

			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) {
				// In production, show user-friendly message; in dev, show technical details
				const isDev = process.env.NODE_ENV === 'development';
				setError(isDev ? error.message : t('errorMessage'));
			} else {
				setMessage(t('successMessage'));
				setTimeout(() => {
					// Force full reload to ensure middleware sees the new session
					// Redirect to dashboard after successful password reset
					window.location.href = '/dashboard';
				}, 2000);
			}
		} catch {
			setError(t('errorMessage'));
		} finally {
			setLoading(false);
		}
	};

	// Show loading state while checking session
	if (checkingSession) {
		return (
			<Flex
				justify="center"
				align="center"
				style={{
					minHeight: '100vh',
					background: token.colorBgLayout,
				}}
			>
				<Card
					style={{
						width: '100%',
						maxWidth: 420,
						background: isDark ? 'rgba(21, 31, 50, 0.75)' : 'rgba(255, 255, 255, 0.85)',
						backdropFilter: 'blur(20px)',
					}}
					loading
				/>
			</Flex>
		);
	}

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
							title={error}
							type="error"
							showIcon
							style={{ marginBottom: 24, borderRadius: 12 }}
						/>
					)}
					{message && (
						<Alert
							title={message}
							type="success"
							showIcon
							style={{ marginBottom: 24, borderRadius: 12 }}
						/>
					)}

					<Form
						name="reset-password"
						onFinish={handleUpdate}
						layout="vertical"
						size="large"
						validateTrigger="onBlur"
					>
						<Form.Item
							name="password"
							rules={[
								{ required: true, message: t('newPasswordRequired') },
								{ min: 6, message: t('newPasswordMin') },
							]}
						>
							<Input.Password
								prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
								placeholder={t('newPasswordLabel')}
								style={{ borderRadius: 12 }}
								className="ph-no-capture"
								suppressHydrationWarning
							/>
						</Form.Item>

						<Form.Item
							name="confirm"
							dependencies={['password']}
							hasFeedback
							rules={[
								{ required: true, message: t('confirmPasswordRequired') },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue('password') === value) {
											return Promise.resolve();
										}
										return Promise.reject(new Error(t('passwordMismatch')));
									},
								}),
							]}
						>
							<Input.Password
								prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
								placeholder={t('confirmPasswordLabel')}
								style={{ borderRadius: 12 }}
								className="ph-no-capture"
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
								{t('updateButton')}
							</Button>
						</Form.Item>

						<div style={{ textAlign: 'center' }}>
							<Button
								type="link"
								icon={<HomeOutlined />}
								onClick={() => router.push('/')}
								style={{ color: token.colorPrimary, fontWeight: 500 }}
							>
								Home
							</Button>
						</div>
					</Form>
				</Card>
			</motion.div>
		</Flex>
	);
}
