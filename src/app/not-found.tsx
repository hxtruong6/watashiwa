'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button, Flex, Result, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';

const { useToken } = theme;

export default function NotFound() {
	const router = useRouter();
	const t = useTranslations('NotFound');
	const { token } = useToken();

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				height: 'calc(100vh - 96px)',
				overflow: 'hidden',
				background: token.colorBgLayout,
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
					<span
						style={{
							fontSize: 'clamp(2rem, 5vw, 3rem)',
							fontWeight: 800,
							color: token.colorPrimary,
							marginTop: 0,
						}}
					>
						{t('title')}
					</span>
				}
				subTitle={
					<span
						style={{
							fontSize: 'clamp(1rem, 3vw, 1.25rem)',
							color: token.colorTextSecondary,
							maxWidth: 600,
							display: 'block',
							margin: '0 auto',
						}}
					>
						{t('subTitle')}
					</span>
				}
				extra={
					<Flex gap="middle" justify="center" style={{ marginTop: 24 }}>
						<Button type="primary" size="large" onClick={() => router.push('/')}>
							{t('backHome')}
						</Button>
					</Flex>
				}
			/>
		</Flex>
	);
}
