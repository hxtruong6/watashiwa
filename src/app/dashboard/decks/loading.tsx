'use client';

import { Card, Col, Row, Skeleton } from 'antd';
import React from 'react';

export default function MyDecksLoading() {
	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
			<Skeleton.Input active size="large" style={{ width: 200, marginBottom: 24 }} />
			<Row gutter={[16, 16]}>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Col xs={24} sm={12} md={8} key={i}>
						<Card style={{ borderRadius: 12, height: 200 }}>
							<Skeleton active avatar paragraph={{ rows: 2 }} />
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
}
