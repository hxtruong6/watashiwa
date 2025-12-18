'use client';

import { Card, Col, Flex, Row, Skeleton } from 'antd';
import React from 'react';

export default function Loading() {
	return (
		<div style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 16px' }}>
			{/* Hero Section Skeleton */}
			<Card style={{ marginBottom: 24, borderRadius: 16 }}>
				<Skeleton active avatar paragraph={{ rows: 2 }} />
			</Card>

			{/* Review CTA Skeleton */}
			<Card style={{ marginBottom: 24, borderRadius: 16, height: 120 }}>
				<Flex align="center" justify="center" style={{ height: '100%' }}>
					<Skeleton.Button active size="large" shape="round" style={{ width: 200 }} />
				</Flex>
			</Card>

			{/* Stats Grid Skeleton */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={12} sm={6}>
					<Card style={{ borderRadius: 12 }}>
						<Skeleton.Input active size="small" />
						<Skeleton.Button active block style={{ marginTop: 8 }} />
					</Card>
				</Col>
				<Col xs={12} sm={6}>
					<Card style={{ borderRadius: 12 }}>
						<Skeleton.Input active size="small" />
						<Skeleton.Button active block style={{ marginTop: 8 }} />
					</Card>
				</Col>
				<Col xs={12} sm={6}>
					<Card style={{ borderRadius: 12 }}>
						<Skeleton.Input active size="small" />
						<Skeleton.Button active block style={{ marginTop: 8 }} />
					</Card>
				</Col>
				<Col xs={12} sm={6}>
					<Card style={{ borderRadius: 12 }}>
						<Skeleton.Input active size="small" />
						<Skeleton.Button active block style={{ marginTop: 8 }} />
					</Card>
				</Col>
			</Row>

			{/* Weekly Chart Skeleton */}
			<Card style={{ marginBottom: 24, borderRadius: 16, height: 300 }}>
				<Skeleton active paragraph={{ rows: 6 }} />
			</Card>

			{/* My Decks Skeleton */}
			<div style={{ marginBottom: 16 }}>
				<Skeleton.Input active style={{ marginBottom: 16 }} />
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} md={8}>
						<Card style={{ borderRadius: 12, height: 150 }}>
							<Skeleton active />
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8}>
						<Card style={{ borderRadius: 12, height: 150 }}>
							<Skeleton active />
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8}>
						<Card style={{ borderRadius: 12, height: 150 }}>
							<Skeleton active />
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	);
}
