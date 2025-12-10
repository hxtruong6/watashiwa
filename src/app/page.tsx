'use client';

import React, { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Typography, Card, Statistic, Row, Col, Button, Flex } from 'antd';
import { FireOutlined, ThunderboltOutlined, BookOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { syncUser } from '@/services/actions';

const { Title, Text } = Typography;

export default function Home() {
	const router = useRouter();

	// Ensure user is active (User record exists) when they visit the dashboard
	useEffect(() => {
		syncUser();
	}, []);

	return (
		<DashboardLayout>
			<div style={{ maxWidth: 800, margin: '0 auto' }}>
				<Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
					<div>
						<Title level={2} style={{ margin: 0 }}>
							Good Morning!
						</Title>
						<Text type="secondary">Ready to master some Kanji today?</Text>
					</div>
					<Button
						type="primary"
						size="large"
						icon={<ThunderboltOutlined />}
						onClick={() => router.push('/study')}
						style={{ padding: '0 32px', height: 48, fontSize: 18 }}
					>
						Start Review
					</Button>
				</Flex>

				<Row gutter={[16, 16]}>
					<Col xs={24} sm={8}>
						<Card variant="borderless">
							<Statistic
								title="Due Reviews"
								value={0} // Placeholder until we fetch real stats
								styles={{ content: { color: '#E64A19' } }}
								prefix={<FireOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={8}>
						<Card variant="borderless">
							<Statistic
								title="New Cards"
								value={0} // Placeholder
								styles={{ content: { color: '#1E3A5F' } }}
								prefix={<BookOutlined />}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={8}>
						<Card variant="borderless">
							<Statistic
								title="Retention Rate"
								value={90} // Placeholder
								precision={1}
								suffix="%"
								styles={{ content: { color: '#708238' } }}
							/>
						</Card>
					</Col>
				</Row>
			</div>
		</DashboardLayout>
	);
}
