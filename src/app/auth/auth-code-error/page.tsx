'use client';

import React, { Suspense } from 'react';
import { Button, Card, Flex, Result } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';

function ErrorContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const error = searchParams.get('error');

	return (
		<Flex justify="center" align="center" style={{ minHeight: '100vh', background: '#F9F7F2' }}>
			<Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bordered={false}>
				<Result
					status="error"
					title="Authentication Failed"
					subTitle={error || 'The link you used may be invalid, expired, or already used.'}
					extra={[
						<Button type="primary" key="login" onClick={() => router.push('/login')}>
							Go to Login
						</Button>,
						<Button key="home" onClick={() => router.push('/')}>
							Go Home
						</Button>,
					]}
				/>
			</Card>
		</Flex>
	);
}

export default function AuthCodeErrorPage() {
	return (
		<Suspense>
			<ErrorContent />
		</Suspense>
	);
}
