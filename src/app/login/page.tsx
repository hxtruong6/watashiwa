'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Flex } from 'antd';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function AuthPage() {
	const [mode, setMode] = useState<'login' | 'signup'>('login');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const handleAuth = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		const { email, password } = values as { email: string; password: string };

		if (mode === 'login') {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				setError(error.message);
			} else {
				router.push('/');
				router.refresh();
			}
		} else {
			// Sign Up Mode
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) {
				setError(error.message);
			} else if (data.session) {
				router.push('/');
				router.refresh();
			} else {
				setMessage('Registration successful! Please check your email to confirm your account.');
			}
		}

		setLoading(false);
	};

	const toggleMode = () => {
		setMode(mode === 'login' ? 'signup' : 'login');
		setError(null);
		setMessage(null);
	};

	return (
		<Flex justify="center" align="center" style={{ minHeight: '100vh', background: '#F9F7F2' }}>
			<Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bordered={false}>
				<div style={{ textAlign: 'center', marginBottom: 24 }}>
					<Title level={2} style={{ color: '#1E3A5F', marginBottom: 0 }}>
						{mode === 'login' ? 'Welcome Back' : 'Join Watashi JP'}
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
					onFinish={handleAuth}
					layout="vertical"
					key={mode} // Forced re-render on mode switch to clear fields
				>
					<Form.Item
						name="email"
						rules={[
							{ required: true, message: 'Please input your Email!' },
							{ type: 'email', message: 'Please enter a valid email!' },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
					</Form.Item>

					<Form.Item
						name="password"
						rules={[
							{ required: true, message: 'Please input your Password!' },
							mode === 'signup' ? { min: 6, message: 'Must be at least 6 characters' } : {},
						]}
					>
						<Input prefix={<LockOutlined />} type="password" placeholder="Password" size="large" />
					</Form.Item>

					{mode === 'login' && (
						<Form.Item style={{ marginBottom: 24 }}>
							<Flex justify="end">
								<Link href="/forgot-password" style={{ color: '#1E3A5F' }}>
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
