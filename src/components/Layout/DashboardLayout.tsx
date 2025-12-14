'use client';

import React from 'react';
import { Layout, Menu, Typography, Flex } from 'antd';
import { HomeOutlined, ReadOutlined, BookOutlined, BarChartOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();

	const menuItems = [
		{
			key: '/',
			icon: <HomeOutlined />,
			label: 'Home',
		},
		{
			key: '/decks',
			icon: <BookOutlined />,
			label: 'Decks',
		},
		{
			key: '/study',
			icon: <ReadOutlined />,
			label: 'Study',
		},
		{
			key: '/stats',
			icon: <BarChartOutlined />,
			label: 'Stats',
		},
	];

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider
				theme="light"
				width={250}
				style={{
					borderRight: '1px solid #f0f0f0',
					position: 'fixed',
					height: '100vh',
					left: 0,
					top: 0,
					zIndex: 10,
				}}
				breakpoint="lg"
				collapsedWidth="0"
			>
				<Flex justify="center" align="center" style={{ height: 64, margin: '16px 0' }}>
					<Title level={4} style={{ margin: 0, color: '#1E3A5F' }}>
						WatashiWa
					</Title>
				</Flex>

				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					items={menuItems}
					onClick={({ key }) => router.push(key)}
					style={{ borderRight: 0 }}
				/>
			</Sider>

			<Layout style={{ marginLeft: 250 }}>
				{/* Note: In a real responsive app, marginLeft needs to be handled via resizing state */}

				<Header
					style={{
						padding: '0 24px',
						background: '#FFFFFF',
						borderBottom: '1px solid #f0f0f0',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Title level={5} style={{ margin: 0 }}>
						Zen Mode
					</Title>
				</Header>

				<Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>{children}</Content>
			</Layout>
		</Layout>
	);
}
