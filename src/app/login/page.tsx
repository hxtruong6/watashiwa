'use client';

import { ambientGradients, customShadows } from '@/lib/theme/themeConfig';
import { loginSchema, signupSchema } from '@/modules/auth/auth.dto';
import { GoogleSignInButton } from '@/modules/auth/components/GoogleSignInButton';
import { LoginMethodSelector } from '@/modules/auth/components/LoginMethodSelector';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useLoginMethodCache } from '@/modules/auth/hooks/useLoginMethodCache';
import { isValidReturnUrl } from '@/modules/ui/components/navbar/NavConfig';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import {
	Alert,
	App,
	Button,
	Card,
	Divider,
	Flex,
	Form,
	Input,
	Spin,
	Typography,
	theme,
} from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function AuthPage() {
	const { token } = useToken();
	const t = useTranslations('Login');
	const { message: antdMessage } = App.useApp();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [mode, setMode] = useState<'login' | 'signup'>('login');
	const [form] = Form.useForm();

	const returnUrl = searchParams.get('returnUrl');
	const [isRedirecting, setIsRedirecting] = useState(false);

	// Restore pending signup data from localStorage on mount and auto-retry when online
	React.useEffect(() => {
		if (mode === 'signup') {
			const pendingSignup = localStorage.getItem('pendingSignup');
			if (pendingSignup) {
				try {
					const data = JSON.parse(pendingSignup);
					form.setFieldsValue(data);
					// Show message that data was restored
					antdMessage.info(
						t('dataRestored') || 'Your previous registration data has been restored. Please retry.',
					);
				} catch (error) {
					console.error('Failed to restore signup data:', error);
					localStorage.removeItem('pendingSignup');
				}
			}

			// Auto-retry when connectivity is restored
			const handleOnline = () => {
				if (pendingSignup && navigator.onLine) {
					antdMessage.info(
						t('networkRestored') || 'Connection restored. You can retry registration now.',
					);
				}
			};

			window.addEventListener('online', handleOnline);
			return () => window.removeEventListener('online', handleOnline);
		}
	}, [mode, form, t, antdMessage]);

	// Login method cache hook
	const { updateCache } = useLoginMethodCache();

	// Use custom auth hook - all business logic is extracted
	const { loading, error, message, login, signup, signInWithGoogle, resetState, setMessage } =
		useAuth({
			onSuccess: (role, isNewUser) => {
				// Show loading indicator during redirect
				setIsRedirecting(true);

				// If returnUrl is provided and valid, redirect there after successful auth
				if (returnUrl && isValidReturnUrl(returnUrl)) {
					// Use window.location.href for full page reload to ensure middleware sees new session
					console.log('[Login] Redirecting to returnUrl:', returnUrl);
					window.location.href = returnUrl;
					return;
				}
				// Redirect new users to profile setup
				if (isNewUser) {
					console.log('[Login] Redirecting new user to profile setup');
					window.location.href = '/profile/setup';
					return;
				}
				// Default redirect: handle role-based or default redirect
				if (role === 'ADMIN') {
					console.log('[Login] Redirecting admin to /admin');
					window.location.href = '/admin';
					return;
				}
				// Force full reload ensures middleware sees the new cookie
				console.log('[Login] Redirecting to home');
				window.location.href = '/';
			},
			onError: (errorMsg) => {
				antdMessage.error(errorMsg);
			},
			t, // Pass translation function for error messages
		});

	const isDark = token.colorBgBase === '#151F32';

	// Reset state when switching modes
	const toggleMode = () => {
		const newMode = mode === 'login' ? 'signup' : 'login';
		setMode(newMode);
		resetState();
	};

	// Handle form submission with Zod validation
	const handleSubmit = async (values: unknown) => {
		if (mode === 'login') {
			// Validate with Zod schema
			const validationResult = loginSchema.safeParse(values);
			if (!validationResult.success) {
				const firstError = validationResult.error.issues[0];
				antdMessage.error(firstError?.message || t('unexpectedError'));
				return;
			}

			const result = await login(validationResult.data.email, validationResult.data.password);
			// Note: Redirect is handled in onSuccess callback
			// Success message is shown briefly before redirect happens
			if (result.success) {
				updateCache(validationResult.data.email, 'email');
				// Don't show success message - redirect happens immediately via onSuccess callback
			}
		} else {
			// Extract only fields needed for Zod validation (exclude confirmPassword)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { confirmPassword, ...signupData } = values as {
				email: string;
				password: string;
				name: string;
				confirmPassword?: string;
			};

			// Validate with Zod schema (confirmPassword already validated by Form rules)
			const validationResult = signupSchema.safeParse(signupData);
			if (!validationResult.success) {
				const firstError = validationResult.error.issues[0];
				antdMessage.error(firstError?.message || t('unexpectedError'));
				return;
			}

			const result = await signup(
				validationResult.data.email,
				validationResult.data.password,
				validationResult.data.name,
			);

			if (result.success) {
				if (result.requiresConfirmation) {
					setMessage(t('checkEmail'));
					antdMessage.success(t('registrationSuccess'));
				} else {
					antdMessage.success(t('signupSuccess'));
				}
			}
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
			{/* Loading overlay during redirect */}
			{isRedirecting && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.5)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 9999,
					}}
				>
					<Flex vertical align="center" gap="middle">
						<Spin size="large" />
						<Text style={{ color: 'white', fontSize: 16 }}>Redirecting...</Text>
					</Flex>
				</div>
			)}
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
						<Image
							src="/assets/w_logo.png"
							alt="Logo"
							width={64}
							height={64}
							loading="eager"
							priority
							suppressHydrationWarning
							onClick={() => router.push('/')}
						/>
						<Title
							level={2}
							style={{ color: token.colorPrimary, marginBottom: 8, fontWeight: 800 }}
						>
							{mode === 'login' ? t('welcomeBack') : t('joinWatashiWa')}
						</Title>
						<Text type="secondary" style={{ fontSize: 16 }}>
							{mode === 'login' ? t('signInText') : t('createAccountText')}
						</Text>
						{mode === 'signup' && (
							<Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
								{t('oauthWorksForBoth') || 'Or continue with Google to sign up instantly'}
							</Text>
						)}
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

					{/* Quick login selector - only show in login mode */}
					{mode === 'login' && (
						<Form.Item noStyle shouldUpdate>
							{({ setFieldsValue }) => (
								<LoginMethodSelector
									onEmailClick={(email) => {
										// Pre-fill email in form
										setFieldsValue({ email });
									}}
									onGoogleClick={() => {
										signInWithGoogle();
									}}
								/>
							)}
						</Form.Item>
					)}

					<Form
						form={form}
						name="auth-form"
						initialValues={{ remember: true }}
						onFinish={handleSubmit}
						layout="vertical"
						key={mode} // Forced re-render on mode switch to clear fields
						size="large"
						validateTrigger="onBlur" // Only validate when field loses focus (prevents errors while typing)
					>
						{/* OAuth button - shown for both login and signup */}
						<Form.Item style={{ marginBottom: 16 }}>
							<GoogleSignInButton block />
						</Form.Item>

						{mode === 'login' && (
							<Divider
								style={{
									margin: '0 0 24px 0',
									borderColor: token.colorBorder,
								}}
							>
								<Text type="secondary" style={{ fontSize: 12 }}>
									{t('or') || 'OR'}
								</Text>
							</Divider>
						)}
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
							validateTrigger="onBlur"
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
								...(mode === 'signup' ? [{ min: 6, message: t('passwordMin', { min: 6 }) }] : []),
							]}
							validateTrigger="onBlur"
						>
							<Input.Password
								prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
								placeholder={t('passwordPlaceholder')}
								style={{ borderRadius: 12 }}
								className="ph-no-capture"
								suppressHydrationWarning
							/>
						</Form.Item>

						{mode === 'signup' && (
							<Form.Item
								name="confirmPassword"
								dependencies={['password']}
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
								validateTrigger="onBlur"
							>
								<Input.Password
									prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
									placeholder={t('confirmPasswordPlaceholder')}
									style={{ borderRadius: 12 }}
									className="ph-no-capture"
									suppressHydrationWarning
								/>
							</Form.Item>
						)}

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
