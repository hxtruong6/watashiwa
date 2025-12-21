import themeConfig from '@/lib/theme/themeConfig';
import { getAdminStats } from '@/services/actions';
import { FireOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';

import { StatCard } from './StatCard';

export async function AdminStatsWidget() {
	const stats = await getAdminStats();

	return (
		<Row gutter={[24, 24]}>
			<Col xs={24} sm={12} md={8}>
				<StatCard
					title="Total Users"
					value={stats.userCount}
					icon={<UserOutlined />}
					color={themeConfig.token?.colorPrimary}
				/>
			</Col>
			<Col xs={24} sm={12} md={8}>
				<StatCard
					title="Total Reviews"
					value={stats.reviewCount}
					icon={<ReadOutlined />}
					color={themeConfig.token?.colorSuccess}
				/>
			</Col>
			<Col xs={24} sm={12} md={8}>
				<StatCard
					title="Active Today"
					value={stats.activeToday}
					icon={<FireOutlined />}
					color={themeConfig.token?.colorWarning}
				/>
			</Col>
		</Row>
	);
}
