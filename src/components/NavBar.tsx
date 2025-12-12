'use client';

import React, { useState } from 'react';
import {
	Layout,
	Menu,
	Button,
	Flex,
	Typography,
	Drawer,
	Tooltip,
	Tag,
	Avatar,
	Dropdown,
	Space,
} from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSelector from './LanguageSelector';
import ShareModal from './ShareModal';
import { createClient } from '@/utils/supabase/client';
import {
	LogoutOutlined,
	BookOutlined,
	DashboardOutlined,
	MenuOutlined,
	BarChartOutlined,
	CommentOutlined,
	UserOutlined,
	SettingOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

// Define types locally or import
interface User {
	id: string;
	email?: string;
	user_metadata?: {
		full_name?: string;
		avatar_url?: string;
	};
}

export default function NavBar({ user }: { user?: User | null }) {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);

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
					<Tag color="cyan" style={{ marginLeft: 8, fontSize: 10, border: 'none' }}>
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
					<Tag color="cyan" style={{ marginLeft: 8, fontSize: 10, border: 'none' }}>
						Soon
					</Tag>
				</Tooltip>
				// <Link href="/community" onClick={closeDrawer}>
				// 	{t('community')}
				// </Link>
			),
		},
	];

	// User Dropdown Menu
	const userMenuProps: MenuProps = {
		items: [
			{
				key: 'email',
				label: (
					<Flex vertical gap={2} style={{ padding: '4px 0' }}>
						<Text strong style={{ fontSize: 13 }}>
							{user?.user_metadata?.full_name || 'User'}
						</Text>
						<Text type="secondary" style={{ fontSize: 11 }}>
							{user?.email}
						</Text>
					</Flex>
				),
				disabled: true,
				style: { cursor: 'default', opacity: 1 },
			},
			{
				type: 'divider',
			},
			{
				key: 'settings',
				icon: <SettingOutlined />,
				label: 'Settings', // Placeholder, could be linked
				disabled: true, // TODO: Implement settings page
			},
			{
				key: 'share',
				icon: <ShareAltOutlined />,
				label: t('share'),
				onClick: () => {
					setShareModalOpen(true);
					// setDrawerOpen(false); // Optional: keep drawer open?
				},
			},
			{
				key: 'logout',
				icon: <LogoutOutlined />,
				label: tCommon('logout'),
				onClick: handleLogout,
				danger: true,
			},
		],
	};

	const isPublic = !user;

	return (
		<Header
			style={{
				display: 'flex',
				justifyContent: 'center', // Center content
				background: 'rgba(255, 255, 255, 0.8)', // More transparent
				backdropFilter: 'blur(8px)', // Stronger blur
				padding: 0, // Reset padding, will use container
				boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				height: 64,
				borderBottom: '1px solid rgba(0,0,0,0.05)',
			}}
		>
			<div
				style={{
					width: '100%',
					maxWidth: 1280,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 24px',
				}}
			>
				{/* Logo Area */}
				<Flex
					align="center"
					gap="small"
					style={{ cursor: 'pointer' }}
					onClick={() => router.push('/')}
				>
					<div
						style={{
							width: 32,
							height: 32,
							background: 'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)',
							borderRadius: 8,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							fontWeight: 'bold',
							fontSize: 18,
						}}
					>
						W
					</div>
					<Text
						strong
						style={{
							margin: 0,
							color: '#1E3A5F',
							fontSize: 20,
							letterSpacing: '-0.5px',
							fontFamily: 'var(--font-geist-sans, sans-serif)', // Assuming setup
						}}
					>
						WatashiWa
					</Text>
				</Flex>

				{/* CSS for Responsive visibility */}
				<style jsx global>{`
					@media (max-width: 1000px) {
						.desktop-nav {
							display: none !important;
						}
						.mobile-trigger {
							display: inline-flex !important;
						}
					}
					@media (min-width: 1001px) {
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
					style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 24 }}
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
									fontSize: 15,
								}}
								disabledOverflow
							/>

							<Space
								size={16}
								align="center"
								split={<div style={{ width: 1, height: 16, background: '#eee' }} />}
							>
								<LanguageSelector />

								{/* Share Button (Desktop) */}
								<Tooltip title={t('share')}>
									<Button
										type="text"
										icon={<ShareAltOutlined style={{ fontSize: 18, color: '#1E3A5F' }} />}
										onClick={() => setShareModalOpen(true)}
									/>
								</Tooltip>

								<Dropdown menu={userMenuProps} trigger={['click']} placement="bottomRight">
									<Space
										style={{
											cursor: 'pointer',
											padding: '4px 8px',
											borderRadius: 6,
											transition: 'background 0.2s',
										}}
										className="user-dropdown-trigger"
									>
										<Avatar
											size="small"
											icon={<UserOutlined />}
											src={user?.user_metadata?.avatar_url}
											style={{ backgroundColor: '#1E3A5F' }}
										>
											{user?.email?.[0]?.toUpperCase()}
										</Avatar>
										{/* <DownOutlined style={{ fontSize: 10, color: '#999' }} /> */}
									</Space>
								</Dropdown>
							</Space>
						</>
					) : (
						<Flex gap="middle" align="center">
							<LanguageSelector />
							<Link href="/login">
								<Button
									type="primary"
									shape="round"
									style={{ background: '#1E3A5F', padding: '0 24px', fontWeight: 500 }}
								>
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
				{/* For public mobile */}
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
							<Flex align="center" gap="small">
								<div
									style={{
										width: 24,
										height: 24,
										background: 'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)',
										borderRadius: 6,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: 'white',
										fontSize: 12,
									}}
								>
									W
								</div>
								<Text strong style={{ margin: 0, color: '#1E3A5F' }}>
									WatashiWa
								</Text>
							</Flex>
							<Space>
								<LanguageSelector />
							</Space>
						</Flex>
					}
					placement="right"
					onClose={closeDrawer}
					open={drawerOpen}
					width={280}
					styles={{ body: { padding: 0 } }} // Updated from style={{ body: ... }} to styles API in v5? Actually Antd 5 uses styles
				>
					<Flex vertical style={{ height: '100%' }}>
						{user && (
							<div
								style={{
									padding: '20px 24px',
									borderBottom: '1px solid #f0f0f0',
									background: '#fafafa',
								}}
							>
								<Flex gap={12} align="center">
									<Avatar
										size="large"
										icon={<UserOutlined />}
										src={user?.user_metadata?.avatar_url}
										style={{ backgroundColor: '#1E3A5F' }}
									>
										{user?.email?.[0]?.toUpperCase()}
									</Avatar>
									<Flex vertical>
										<Text strong>{user?.user_metadata?.full_name || 'User'}</Text>
										<Text type="secondary" style={{ fontSize: 12 }}>
											{user?.email}
										</Text>
									</Flex>
								</Flex>
							</div>
						)}

						<Menu
							mode="inline"
							selectedKeys={[pathname]}
							items={menuItems}
							style={{ borderRight: 'none', flex: 1 }}
							onClick={closeDrawer}
						/>

						{user && (
							<div style={{ padding: '24px' }}>
								<Button
									block
									icon={<ShareAltOutlined />}
									onClick={() => {
										setShareModalOpen(true);
										setDrawerOpen(false);
									}}
									style={{ marginBottom: 12 }}
								>
									{t('share')}
								</Button>
								<Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>
									{tCommon('logout')}
								</Button>
							</div>
						)}
					</Flex>
				</Drawer>

				<ShareModal open={shareModalOpen} onCancel={() => setShareModalOpen(false)} />
			</div>
		</Header>
	);
}
