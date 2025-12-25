'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button, Flex, Result, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

const { useToken } = theme;

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations('Common');
	const { token } = useToken();

	const isDev = process.env.NODE_ENV === 'development';

	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				height: 'calc(100vh - 110px)',
				overflow: 'hidden',
				background: token.colorBgLayout,
				padding: 24, // Ensure padding on small screens
			}}
		>
			<Result
				icon={
					<div
						style={{
							padding: 0,
							width: '100%',
							maxWidth: 400,
							aspectRatio: '1',
							margin: '0 auto',
							maxHeight: '40vh',
						}}
					>
						<DotLottieReact
							src="/assets/animations/404.lottie"
							loop
							autoplay
							style={{ width: '100%', height: '100%' }}
						/>
					</div>
				}
				title={
					<Typography.Title
						level={1} // Use level 1 for the main error message
						style={{
							margin: 0,
							color: token.colorPrimary,
							fontSize: 'clamp(2rem, 5vw, 3rem)', // Keep responsive sizing but on a Title component
						}}
					>
						{t('error')}
					</Typography.Title>
				}
				subTitle={
					<Typography.Text
						type="secondary"
						style={{
							fontSize: 'clamp(1rem, 3vw, 1.25rem)',
							maxWidth: 600,
							margin: '0 auto',
							display: isDev ? 'block' : 'none',
						}}
					>
						{error.message || t('unexpectedError')}
					</Typography.Text>
				}
				extra={
					<Flex gap="middle" justify="center" style={{ marginTop: 24 }}>
						<Button type="primary" size="large" onClick={() => reset()}>
							{t('retry')}
						</Button>
					</Flex>
				}
			/>
		</Flex>
	);
}
