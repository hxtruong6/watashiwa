'use client';

import React, { Suspense } from 'react';
import { Button, Card, Flex, Result, theme } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { useToken } = theme;

function ErrorContent() {
	const { token } = useToken();
	const t = useTranslations('Auth');
	const router = useRouter();
	const searchParams = useSearchParams();
	const error = searchParams.get('error');

	return (
		<Flex
			justify="center"
			align="center"
			style={{ minHeight: '100vh', background: token.colorBgLayout }}
		>
			<Card
				style={{
					width: 400,
					boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
					background: token.colorBgContainer,
					borderColor: token.colorBorder,
				}}
				bordered={false}
			>
				<Result
					status="error"
					title={t('failedTitle')}
					subTitle={error || t('defaultError')}
					extra={[
						<Button type="primary" key="login" onClick={() => router.push('/login')}>
							{t('goToLogin')}
						</Button>,
						<Button key="home" onClick={() => router.push('/')}>
							{t('goHome')}
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
