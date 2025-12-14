'use client';

import React from 'react';
import { Result, Button, Flex, theme } from 'antd';
import { useTranslations } from 'next-intl';

const { useToken } = theme;

export default function DashboardErrorState() {
	const { token } = useToken();
	const t = useTranslations('Dashboard');
	const tCommon = useTranslations('Common');

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				minHeight: '60vh', // Take up reasonable space
				padding: 40,
			}}
		>
			<Result
				status="warning"
				title={t('loadError')}
				extra={
					<Button
						type="primary"
						key="retry"
						shape="round"
						onClick={() => window.location.reload()}
						style={{ background: token.colorPrimary }}
					>
						{tCommon('retry')}
					</Button>
				}
			/>
		</Flex>
	);
}
