'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Flex, App, theme } from 'antd';
import { createClient } from '@/utils/supabase/client';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { syncUser } from '@/services/actions';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function AuthPage() {
	const { token } = useToken();
	const { message: antdMessage } = App.useApp();
	const [mode, setMode] = useState<'login' | 'signup'>('login');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const supabase = createClient();

	const handleLogin = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const { email, password } = values as { email: string; password: string };
			console.log('Attempting login for:', email);

			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error('Login error:', error.message);
				setError(error.message);
				antdMessage.error(error.message);
			} else {
				console.log('Login successful, syncing user...');
				antdMessage.success('Login successful! Redirecting...');
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
			console.error('Unexpected login error:', err);
			setError('An unexpected error occurred. Please try again.');
			antdMessage.error('An unexpected error occurred.');
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
			console.log('Attempting signup for:', email);

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
				console.error('Signup error:', error.message);
				setError(error.message);
				antdMessage.error(error.message);
			} else if (data.session) {
				console.log('Signup successful (immediate login), syncing user...');
				antdMessage.success('Signup successful! Redirecting...');
				// Logged in immediately
				try {
					await syncUser();
				} catch (syncErr) {
					console.error('User sync failed (non-blocking):', syncErr);
				}
				// Force full reload to ensure middleware catches the new session
				window.location.href = '/';
			} else {
				console.log('Signup successful (confirmation required)');
				setMessage('Registration successful! Please check your email for the confirmation link.');
				antdMessage.success('Registration successful! Check your email.');
			}
		} catch (err) {
			console.error('Unexpected signup error:', err);
			setError('An unexpected error occurred. Please try again.');
			antdMessage.error('An unexpected error occurred.');
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
			style={{ minHeight: '100vh', background: token.colorBgLayout }}
		>
			<Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bordered={false}>
				<div style={{ textAlign: 'center', marginBottom: 24 }}>
					<Title level={2} style={{ color: token.colorPrimary, marginBottom: 0 }}>
						{mode === 'login' ? 'Welcome Back' : 'Join WatashiWa'}
					</Title>
					<Text type="secondary">
						{mode === 'login'
							? 'Sign in to access your decks'
							: 'Create an account to start learning'}
					</Text>
				</div>

				{error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
				{message && (
					<Alert message={message} type="success" showIcon style={{ marginBottom: 24 }} />
				)}

				<Form
					name="auth-form"
					initialValues={{ remember: true }}
					onFinish={mode === 'login' ? handleLogin : handleSignUp}
					layout="vertical"
					key={mode} // Forced re-render on mode switch to clear fields
				>
					{mode === 'signup' && (
						<Form.Item name="name" rules={[{ required: true, message: 'Please input your Name!' }]}>
							<Input
								prefix={<UserOutlined />}
								placeholder="Full Name"
								size="large"
								suppressHydrationWarning
							/>
						</Form.Item>
					)}

					<Form.Item
						name="email"
						rules={[
							{ required: true, message: 'Please input your Email!' },
							{ type: 'email', message: 'Please enter a valid email!' },
						]}
					>
						<Input
							prefix={<MailOutlined />}
							placeholder="Email Address"
							size="large"
							suppressHydrationWarning
						/>
					</Form.Item>

					<Form.Item
						name="password"
						rules={[
							{ required: true, message: 'Please input your Password!' },
							mode === 'signup' ? { min: 6, message: 'Must be at least 6 characters' } : {},
						]}
					>
						<Input
							prefix={<LockOutlined />}
							type="password"
							placeholder="Password"
							size="large"
							suppressHydrationWarning
						/>
					</Form.Item>

					{mode === 'login' && (
						<Form.Item style={{ marginBottom: 24 }}>
							<Flex justify="end">
								<Link href="/forgot-password" style={{ color: token.colorPrimary }}>
									Forgot password?
								</Link>
							</Flex>
						</Form.Item>
					)}

					<Form.Item style={{ marginBottom: 12 }}>
						<Button
							type="primary"
							htmlType="submit"
							style={{ width: '100%' }}
							size="large"
							loading={loading}
						>
							{mode === 'login' ? 'Log in' : 'Sign up'}
						</Button>
					</Form.Item>

					<div style={{ textAlign: 'center' }}>
						<Text type="secondary">
							{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
						</Text>{' '}
						<Button type="link" onClick={toggleMode} style={{ padding: 0 }}>
							{mode === 'login' ? 'Sign up' : 'Log in'}
						</Button>
					</div>
				</Form>
			</Card>
		</Flex>
	);
}
