'use client';

import { unsubscribeFromEmails } from '@/modules/user/user.actions';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Result, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const { Title } = Typography;

function UnsubscribeContent() {
	const t = useTranslations('Unsubscribe');
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		const handleUnsubscribe = async () => {
			const email = searchParams.get('email');
			const token = searchParams.get('token');

			if (!email) {
				setStatus('error');
				setMessage(t('error.missingEmail'));
				return;
			}

			try {
				const result = await unsubscribeFromEmails({ email, token: token || undefined });

				if (result.success) {
					setStatus('success');
					setMessage(t('success.message'));
				} else {
					setStatus('error');
					setMessage(result.error || t('error.generic'));
				}
			} catch (error) {
				console.error('Unsubscribe error:', error);
				setStatus('error');
				setMessage(t('error.generic'));
			}
		};

		handleUnsubscribe();
	}, [searchParams, t]);

	if (status === 'loading') {
		return (
			<Flex
				vertical
				align="center"
				justify="center"
				style={{
					minHeight: 'calc(100vh - 200px)',
					padding: '48px 24px',
				}}
			>
				<Title level={2}>{t('loading')}</Title>
			</Flex>
		);
	}

	return (
		<Flex
			vertical
			align="center"
			justify="center"
			style={{
				minHeight: 'calc(100vh - 200px)',
				padding: '48px 24px',
			}}
		>
			<Result
				status={status === 'success' ? 'success' : 'error'}
				icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
				title={status === 'success' ? t('success.title') : t('error.title')}
				subTitle={message}
				extra={
					<Button type="primary" href="/">
						{t('backToHome')}
					</Button>
				}
			/>
		</Flex>
	);
}

export default function UnsubscribePage() {
	return (
		<Suspense
			fallback={
				<Flex
					vertical
					align="center"
					justify="center"
					style={{
						minHeight: 'calc(100vh - 200px)',
						padding: '48px 24px',
					}}
				>
					<Title level={2}>Loading...</Title>
				</Flex>
			}
		>
			<UnsubscribeContent />
		</Suspense>
	);
}
