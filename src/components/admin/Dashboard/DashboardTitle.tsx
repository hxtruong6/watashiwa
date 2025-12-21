'use client';

import { Typography } from 'antd';
import React from 'react';

const { Title } = Typography;

interface DashboardTitleProps {
	level?: 1 | 2 | 3 | 4 | 5;
	children: React.ReactNode;
	style?: React.CSSProperties;
}

export const DashboardTitle: React.FC<DashboardTitleProps> = ({ level = 2, children, style }) => {
	return (
		<Title level={level} style={style}>
			{children}
		</Title>
	);
};
