'use client';

import { createClient } from '@/utils/supabase/client';
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Form, Input, Typography, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function ForgotPasswordPage() {
	const { token } = useToken();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const handleReset = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		const { email } = values as { email: string };

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
		});

		if (error) {
			setError(error.message);
		} else {
			setMessage('Password reset link has been sent to your email.');
		}
		setLoading(false);
	};

	return (
		<Flex
			justify="center"
			align="center"
			style={{ minHeight: '100vh', background: token.colorBgLayout }}
		>
			<Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bordered={false}>
				<div style={{ textAlign: 'center', marginBottom: 24 }}>
					<Title level={3} style={{ color: token.colorPrimary, marginBottom: 0 }}>
						Forgot Password
					</Title>
					<Text type="secondary">Enter your email to receive a reset link</Text>
				</div>

				{error && <Alert title={error} type="error" showIcon style={{ marginBottom: 24 }} />}
				{message && <Alert title={message} type="success" showIcon style={{ marginBottom: 24 }} />}

				<Form name="forgot-password" onFinish={handleReset} layout="vertical">
					<Form.Item
						name="email"
						rules={[
							{ required: true, message: 'Please input your Email!' },
							{ type: 'email', message: 'Please enter a valid email!' },
						]}
					>
						<Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							style={{ width: '100%' }}
							size="large"
							loading={loading}
						>
							Send Reset Link
						</Button>
						<div style={{ marginTop: 12, textAlign: 'center' }}>
							<Button
								type="link"
								size="small"
								icon={<ArrowLeftOutlined />}
								onClick={() => router.push('/login')}
							>
								Back to Login
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Card>
		</Flex>
	);
}
