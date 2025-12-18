'use client';

import { createClient } from '@/utils/supabase/client';
import { LockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Form, Input, Typography, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function ResetPasswordPage() {
	const { token } = useToken();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const handleUpdate = async (values: unknown) => {
		setLoading(true);
		setError(null);
		setMessage(null);

		const { password } = values as { password: string };

		const { error } = await supabase.auth.updateUser({
			password: password,
		});

		if (error) {
			setError(error.message);
		} else {
			setMessage('Password updated successfully! Redirecting...');
			setTimeout(() => {
				router.push('/');
			}, 2000);
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
						Set New Password
					</Title>
					<Text type="secondary">Enter your new secure password</Text>
				</div>

				{error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
				{message && (
					<Alert message={message} type="success" showIcon style={{ marginBottom: 24 }} />
				)}

				<Form name="reset-password" onFinish={handleUpdate} layout="vertical">
					<Form.Item
						name="password"
						rules={[
							{ required: true, message: 'Please input your new Password!' },
							{ min: 6, message: 'Password must be at least 6 characters.' },
						]}
					>
						<Input
							prefix={<LockOutlined />}
							type="password"
							placeholder="New Password"
							size="large"
						/>
					</Form.Item>

					<Form.Item
						name="confirm"
						dependencies={['password']}
						hasFeedback
						rules={[
							{ required: true, message: 'Please confirm your password!' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error('The two passwords that you entered do not match!'),
									);
								},
							}),
						]}
					>
						<Input
							prefix={<LockOutlined />}
							type="password"
							placeholder="Confirm Password"
							size="large"
						/>
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							style={{ width: '100%' }}
							size="large"
							loading={loading}
						>
							Update Password
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</Flex>
	);
}
