'use client';

import { Card, Flex, Skeleton } from 'antd';
import React from 'react';

export default function ExercisesLoading() {
	return (
		<Flex justify="center" align="center" style={{ minHeight: '60vh', padding: 24 }}>
			<Card style={{ width: '100%', maxWidth: 800, borderRadius: 16 }}>
				<Skeleton active paragraph={{ rows: 6 }} />
			</Card>
		</Flex>
	);
}
