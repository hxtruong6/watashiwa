'use client';

import LanguageSelector from '@/components/LanguageSelector';
import { hasRole } from '@/lib/auth/roleGuard';
import {
	ArrowLeftOutlined,
	BookOutlined,
	DashboardOutlined,
	FlagOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	ReadOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { UserRole } from '@prisma/client';
import { Avatar, Button, Flex, Layout, Menu, type MenuProps, Tooltip, theme } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const { Header, Sider, Content } = Layout;

interface AdminShellProps {
	children: React.ReactNode;
	user: {
		name?: string | null;
		image?: string | null;
		role: UserRole;
	};
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, user }) => {
	const [collapsed, setCollapsed] = useState(false);
	const { token } = theme.useToken();
	const { colorBgContainer, colorPrimary } = token;
	const router = useRouter();
	const pathname = usePathname();

	// Menu Items logic based on Role
	// Note: We use a loop or conditional spread to build this to avoid messy JSX in the `items` prop
	const getItems = (): MenuProps['items'] => {
		const items: NonNullable<MenuProps['items']> = [
			{
				key: '/admin',
				icon: <DashboardOutlined />,
				label: 'Dashboard',
			},
			// ...
		];

		if (hasRole(user.role, UserRole.ADMIN)) {
			items.push({
				key: '/admin/users',
				icon: <UserOutlined />,
				label: 'Users',
			});
		}

		items.push({
			type: 'divider',
		});

		const contentChildren = [
			{
				key: '/admin/content',
				icon: <BookOutlined />,
				label: 'Content',
			},
		];

		if (hasRole(user.role, UserRole.ADMIN)) {
			contentChildren.push({
				key: '/admin/decks',
				icon: <ReadOutlined />,
				label: 'Decks',
			});
		}

		items.push({
			key: 'grp-content',
			label: 'Content',
			type: 'group',
			children: contentChildren,
		});

		items.push({
			key: '/admin/reports',
			icon: <FlagOutlined />,
			label: 'User Reports',
		});

		return items;
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				theme="light"
				width={260}
				style={{ borderRight: '1px solid #f0f0f0' }}
			>
				<div
					style={{
						height: 64,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0 16px',
						borderBottom: '1px solid #f0f0f0',
					}}
				>
					<Flex align="center" gap="small" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
						<div
							style={{
								width: 32,
								height: 32,
								background: colorPrimary,
								borderRadius: 8,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontWeight: '900',
								fontSize: 18,
								flexShrink: 0,
							}}
						>
							W
						</div>
						{!collapsed && (
							<span
								style={{
									fontSize: 16,
									fontWeight: 700,
									color: token.colorTextHeading,
									fontFamily: 'var(--font-geist-sans)',
									opacity: 1,
									transition: 'opacity 0.3s',
								}}
							>
								WatashiWa Admin
							</span>
						)}
					</Flex>
				</div>
				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					items={getItems()}
					onClick={(e) => router.push(e.key)}
					style={{ borderRight: 0, padding: '16px 0' }}
				/>
			</Sider>
			<Layout>
				<Header
					style={{
						padding: '0 24px 0 0',
						background: colorBgContainer,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						height: 64,
						borderBottom: '1px solid #f0f0f0',
					}}
				>
					<Button
						type="text"
						icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={() => setCollapsed(!collapsed)}
						style={{
							fontSize: '16px',
							width: 64,
							height: 64,
						}}
					/>
					<Flex align="center" gap="large">
						<LanguageSelector />

						<Flex align="center" gap="small">
							<Link href="/dashboard?app=true">
								<Tooltip title="Exit Admin Console">
									<Button type="text" icon={<ArrowLeftOutlined />}>
										App
									</Button>
								</Tooltip>
							</Link>

							<div style={{ width: 1, height: 24, background: '#f0f0f0' }} />

							<Flex
								align="center"
								gap="small"
								style={{
									padding: '4px 8px',
									borderRadius: 20,
									background: 'rgba(0,0,0,0.02)',
									border: '1px solid #f0f0f0',
								}}
							>
								<Avatar
									size="small"
									src={user.image}
									icon={<UserOutlined />}
									style={{ backgroundColor: colorPrimary }}
								>
									{user.name?.[0]}
								</Avatar>
								<Flex vertical gap={0} style={{ paddingRight: 8 }}>
									<span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>
										{user.name || 'Admin'}
									</span>
									<span
										style={{
											fontSize: 10,
											color: token.colorTextSecondary,
											lineHeight: 1,
											textTransform: 'uppercase',
										}}
									>
										{user.role}
									</span>
								</Flex>
							</Flex>
						</Flex>
					</Flex>
				</Header>
				<Content
					style={{
						margin: '24px',
						padding: 24,
						minHeight: 280,
					}}
				>
					{children}
				</Content>
			</Layout>
		</Layout>
	);
};
