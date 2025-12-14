'use client';

import React from 'react';
import { Result, Button, Flex } from 'antd';
import { useTranslations } from 'next-intl';

export default function DashboardErrorState() {
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
						style={{ background: '#1E3A5F' }}
					>
						{tCommon('retry')}
					</Button>
				}
			/>
		</Flex>
	);
}
