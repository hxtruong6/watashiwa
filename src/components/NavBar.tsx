'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Flex, Typography, Drawer, Tooltip, Tag } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSelector from './LanguageSelector';
import { createClient } from '@/utils/supabase/client';
import {
	LogoutOutlined,
	BookOutlined,
	DashboardOutlined,
	MenuOutlined,
	BarChartOutlined,
	CommentOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Title } = Typography;

// Define types locally or import
interface User {
	id: string;
	email?: string;
}

export default function NavBar({ user }: { user?: User | null }) {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();
	const [drawerOpen, setDrawerOpen] = useState(false);

	const t = useTranslations('NavBar');
	const tCommon = useTranslations('Common');

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/login');
		router.refresh();
		setDrawerOpen(false);
	};

	const showDrawer = () => setDrawerOpen(true);
	const closeDrawer = () => setDrawerOpen(false);

	// Don't show NavBar on login or study pages (immersive mode), or Admin Panel
	if (pathname === '/login' || pathname === '/study' || pathname?.startsWith('/admin')) {
		return null;
	}

	const menuItems: MenuProps['items'] = [
		{
			key: '/',
			icon: <DashboardOutlined />,
			label: (
				<Link href="/" onClick={closeDrawer}>
					{t('dashboard')}
				</Link>
			),
		},
		{
			key: '/decks',
			icon: <BookOutlined />,
			label: (
				<Link href="/decks" onClick={closeDrawer}>
					{t('decks')}
				</Link>
			),
		},

		{
			key: 'analytics',
			icon: <BarChartOutlined style={{ color: '#aaa' }} />,
			label: (
				<Tooltip title={tCommon('soon')}>
					<span style={{ color: '#aaa', cursor: 'not-allowed' }}>{t('analytics')}</span>
					<Tag color="default" style={{ marginLeft: 8, fontSize: 10 }}>
						Soon
					</Tag>
				</Tooltip>
			),
			disabled: true,
		},
		{
			key: 'community',
			icon: <CommentOutlined style={{ color: '#aaa' }} />,
			label: (
				<Tooltip title={tCommon('soon')}>
					<span style={{ color: '#aaa', cursor: 'not-allowed' }}>{t('community')}</span>
					<Tag color="default" style={{ marginLeft: 8, fontSize: 10 }}>
						Soon
					</Tag>
				</Tooltip>
			),
			disabled: true,
		},
	];

	// If not logged in, show minimal items or just Logo
	// Actually, if on landing page, we might want "Login" button instead of specific menu
	const isPublic = !user;

	return (
		<Header
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				background: 'rgba(255, 255, 255, 0.95)',
				backdropFilter: 'blur(10px)',
				padding: '0 24px',
				boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				height: 64,
				borderBottom: '1px solid #f0f0f0',
			}}
		>
			{/* Logo Area */}
			<Flex
				align="center"
				gap="small"
				style={{ cursor: 'pointer' }}
				onClick={() => router.push('/')}
			>
				{/* Could add an SVG logo here */}
				<Title level={4} style={{ margin: 0, color: '#1E3A5F', minWidth: 120 }}>
					WatashiWa
				</Title>
			</Flex>

			{/* CSS for Responsive visibility */}
			<style jsx global>{`
				@media (max-width: 1100px) {
					.desktop-nav {
						display: none !important;
					}
					.mobile-trigger {
						display: inline-flex !important;
					}
				}
				@media (min-width: 1101px) {
					.desktop-nav {
						display: flex !important;
					}
					.mobile-trigger {
						display: none !important;
					}
				}
			`}</style>

			{/* Desktop Menu */}
			<div
				className="desktop-nav"
				style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}
			>
				{!isPublic ? (
					<>
						<Menu
							mode="horizontal"
							selectedKeys={[pathname]}
							items={menuItems}
							style={{
								borderBottom: 'none',
								background: 'transparent',
								flex: 1,
								justifyContent: 'flex-end',
							}}
							disabledOverflow
						/>

						<LanguageSelector />

						<Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
							{/* {tCommon('logout')} */}
						</Button>
					</>
				) : (
					<Flex gap="small" align="center">
						<LanguageSelector />
						<Link href="/login">
							<Button type="primary" style={{ background: '#1E3A5F' }}>
								Login
							</Button>
						</Link>
					</Flex>
				)}
			</div>

			{/* Mobile Trigger */}
			{!isPublic && (
				<div className="mobile-trigger">
					<Button type="text" icon={<MenuOutlined />} onClick={showDrawer} size="large" />
				</div>
			)}
			{/* For public mobile, maybe show Login? */}
			{isPublic && (
				<div className="mobile-trigger">
					<Flex gap="small" align="center">
						<LanguageSelector />
						<Link href="/login">
							<Button type="primary" size="small" style={{ background: '#1E3A5F' }}>
								Login
							</Button>
						</Link>
					</Flex>
				</div>
			)}

			{/* Mobile Drawer */}
			<Drawer
				title={
					<Flex justify="space-between" align="center">
						<Title level={4} style={{ margin: 0, color: '#1E3A5F' }}>
							{t('menu')}
						</Title>
						<LanguageSelector />
					</Flex>
				}
				placement="right"
				onClose={closeDrawer}
				open={drawerOpen}
				size="default"
				styles={{ body: { padding: 0 } }}
			>
				<Flex vertical style={{ height: '100%' }}>
					<Menu
						mode="inline"
						selectedKeys={[pathname]}
						items={menuItems}
						style={{ borderRight: 'none', flex: 1 }}
					/>
					<div style={{ padding: '24px', borderTop: '1px solid #f0f0f0' }}>
						<Button block danger icon={<LogoutOutlined />} onClick={handleLogout} size="large">
							{tCommon('logout')}
						</Button>
					</div>
				</Flex>
			</Drawer>
		</Header>
	);
}
