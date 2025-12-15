'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Flex, App, theme } from 'antd';
import { createClient } from '@/utils/supabase/client';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { syncUser } from '@/services/actions';
import { useTranslations } from 'next-intl';
import { ambientGradients, customShadows } from '@/lib/theme/themeConfig';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function AuthPage() {
	const { token } = useToken();
	const t = useTranslations('Login');
	const { message: antdMessage } = App.useApp();
	const [mode, setMode] = useState<'login' | 'signup'>('login');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const supabase = createClient();
	const isDark = token.colorBgBase === '#151F32';

	const handleLogin = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const { email, password } = values as { email: string; password: string };

			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				setError(error.message);
				antdMessage.error(error.message);
			} else {
				antdMessage.success(t('loginSuccess'));
				// Check session and sync user to DB
				try {
					await syncUser();
				} catch (syncErr) {
					console.error('User sync failed (non-blocking):', syncErr);
				}
				// Force full reload ensures middleware sees the new cookie
				window.location.href = '/';
			}
		} catch (err) {
			setError(t('unexpectedError'));
			antdMessage.error(t('unexpectedError'));
		} finally {
			setLoading(false);
		}
	};

	const handleSignUp = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const { email, password, name } = values as { email: string; password: string; name: string };

			// Standard SignUp
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
					data: {
						full_name: name,
					},
				},
			});

			if (error) {
				setError(error.message);
				antdMessage.error(error.message);
			} else if (data.session) {
				antdMessage.success(t('signupSuccess'));
				// Logged in immediately
				try {
					await syncUser();
				} catch (syncErr) {
					antdMessage.error(t('unexpectedError'));
				}
				// Force full reload to ensure middleware catches the new session
				window.location.href = '/';
			} else {
				setMessage(t('checkEmail'));
				antdMessage.success(t('registrationSuccess'));
			}
		} catch (err) {
			setError(t('unexpectedError'));
			antdMessage.error(t('unexpectedError'));
		} finally {
			setLoading(false);
		}
	};

	const toggleMode = () => {
		setMode(mode === 'login' ? 'signup' : 'login');
		setError(null);
		setMessage(null);
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
			{/* Ambient Background - Reused from Hero */}
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
						<Title
							level={2}
							style={{ color: token.colorPrimary, marginBottom: 8, fontWeight: 800 }}
						>
							{mode === 'login' ? t('welcomeBack') : t('joinWatashiWa')}
						</Title>
						<Text type="secondary" style={{ fontSize: 16 }}>
							{mode === 'login' ? t('signInText') : t('createAccountText')}
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
						name="auth-form"
						initialValues={{ remember: true }}
						onFinish={mode === 'login' ? handleLogin : handleSignUp}
						layout="vertical"
						key={mode} // Forced re-render on mode switch to clear fields
						size="large"
					>
						{mode === 'signup' && (
							<Form.Item name="name" rules={[{ required: true, message: t('nameRequired') }]}>
								<Input
									prefix={<UserOutlined style={{ color: token.colorTextTertiary }} />}
									placeholder={t('fullNamePlaceholder')}
									style={{ borderRadius: 12 }}
									suppressHydrationWarning
								/>
							</Form.Item>
						)}

						<Form.Item
							name="email"
							rules={[
								{ required: true, message: t('emailRequired') },
								{ type: 'email', message: t('emailInvalid') },
							]}
						>
							<Input
								prefix={<MailOutlined style={{ color: token.colorTextTertiary }} />}
								placeholder={t('emailPlaceholder')}
								style={{ borderRadius: 12 }}
								suppressHydrationWarning
							/>
						</Form.Item>

						<Form.Item
							name="password"
							rules={[
								{ required: true, message: t('passwordRequired') },
								mode === 'signup' ? { min: 6, message: t('passwordMin') } : {},
							]}
						>
							<Input.Password
								prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
								placeholder={t('passwordPlaceholder')}
								style={{ borderRadius: 12 }}
								suppressHydrationWarning
							/>
						</Form.Item>

						{mode === 'login' && (
							<Form.Item style={{ marginBottom: 24 }}>
								<Flex justify="end">
									<Link
										href="/forgot-password"
										style={{ color: token.colorPrimary, fontWeight: 500 }}
									>
										{t('forgotPassword')}
									</Link>
								</Flex>
							</Form.Item>
						)}

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
								{mode === 'login' ? t('loginButton') : t('signupButton')}
							</Button>
						</Form.Item>

						<div style={{ textAlign: 'center' }}>
							<Text type="secondary">
								{mode === 'login' ? t('noAccount') : t('alreadyHaveAccount')}
							</Text>{' '}
							<Button
								type="link"
								onClick={toggleMode}
								style={{ padding: 0, fontWeight: 600, marginLeft: 4 }}
							>
								{mode === 'login' ? t('signupButton') : t('loginButton')}
							</Button>
						</div>
					</Form>
				</Card>
			</motion.div>
		</Flex>
	);
}
