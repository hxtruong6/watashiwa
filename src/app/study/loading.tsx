'use client';

import { Card, Flex, Skeleton } from 'antd';
import React from 'react';

export default function StudyLoading() {
	return (
		<Flex justify="center" align="center" style={{ minHeight: '60vh', padding: 24 }}>
			<Card style={{ width: '100%', maxWidth: 600, borderRadius: 16 }}>
				<Skeleton active paragraph={{ rows: 4 }} />
				<Skeleton.Button active size="large" style={{ marginTop: 16, width: 200 }} />
			</Card>
		</Flex>
	);
}
