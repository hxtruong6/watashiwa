'use client';

import { Card, Col, Row, Skeleton } from 'antd';
import React from 'react';

export default function CoursesLoading() {
	return (
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
			<Skeleton.Input active size="large" style={{ width: 200, marginBottom: 24 }} />
			<Row gutter={[16, 16]}>
				{[1, 2, 3, 4].map((i) => (
					<Col xs={24} sm={12} md={12} key={i}>
						<Card style={{ borderRadius: 12, height: 180 }}>
							<Skeleton active paragraph={{ rows: 3 }} />
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
}
