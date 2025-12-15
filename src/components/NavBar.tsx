'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useState } from 'react';
import {
	Layout,
	Menu,
	Button,
	Flex,
	Typography,
	Tooltip,
	Tag,
	Avatar,
	Dropdown,
	Space,
	theme,
	Grid,
} from 'antd';
import NavDrawer from './navbar/NavDrawer';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSelector from './LanguageSelector';
import ShareModal from './ShareModal';
import SettingsModal from './navbar/SettingsModal';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';

import {
	LogoutOutlined,
	ReadOutlined,
	BookOutlined,
	MenuOutlined,
	BarChartOutlined,
	UserOutlined,
	SettingOutlined,
	ShareAltOutlined,
	FolderOpenOutlined,
	BugOutlined,
	HomeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { MenuProps } from 'antd';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

const { Header } = Layout;
const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

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
	const searchParams = useSearchParams();
	const screens = useBreakpoint();
	const { token } = useToken();
	const supabase = createClient();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	const isXs = mounted ? screens.xs : false; // Default to desktop (false) to match server or mobile? Server usually renders desktop first for SEO or mobile first. Standard is usually "false" for breakpoints on server.

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(timer);
	}, []);
	// Check URL for settings trigger
	useEffect(() => {
		if (searchParams.get('settings') === 'true') {
			// Wrap in setTimeout to avoid synchronous setState warning during effect
			setTimeout(() => setSettingsModalOpen(true), 0);

			// Optional: Remove param from URL
			const params = new URLSearchParams(searchParams.toString());
			params.delete('settings');
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		}
	}, [searchParams, pathname, router]);

	const t = useTranslations('NavBar');
	const tCommon = useTranslations('Common');

	const handleBugReport = async () => {
		const feedback = Sentry.getFeedback();
		if (feedback) {
			const form = await feedback.createForm();
			form.appendToDom();
			form.open();
		}
		// Close menus if needed
		setDrawerOpen(false);
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/login');
		router.refresh();
		setDrawerOpen(false);
	};

	const showDrawer = () => setDrawerOpen(true);
	const closeDrawer = () => setDrawerOpen(false);

	// Don't show NavBar on login or study pages (immersive mode), or Admin Panel
	if (
		pathname === '/login' ||
		pathname === '/study' ||
		pathname === '/exercises' ||
		pathname?.startsWith('/admin')
	) {
		return null;
	}

	const menuItems: MenuProps['items'] = [
		{
			key: '/?app=true',
			icon: <HomeOutlined />,
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
					{t('library')}
				</Link>
			),
		},
		{
			key: '/dashboard/decks',
			icon: <FolderOpenOutlined />,
			label: (
				<Link href="/dashboard/decks" onClick={closeDrawer}>
					{t('myDecks')}
				</Link>
			),
		},
		{
			key: '/dashboard/courses',
			icon: <ReadOutlined />,
			label: (
				<Link href="/dashboard/courses" onClick={closeDrawer}>
					{t('courses')}
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
		// {
		// 	key: 'community',
		// 	icon: <CommentOutlined style={{ color: '#aaa' }} />,
		// 	label: (
		// 		<Tooltip title={tCommon('soon')}>
		// 			<span style={{ color: '#aaa', cursor: 'not-allowed' }}>{t('community')}</span>
		// 			<Tag color="cyan" style={{ marginLeft: 8, fontSize: 10, border: 'none' }}>
		// 				Soon
		// 			</Tag>
		// 		</Tooltip>
		// 		// <Link href="/community" onClick={closeDrawer}>
		// 		// 	{t('community')}
		// 		// </Link>
		// 	),
		// },
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
				key: 'settings',
				icon: <SettingOutlined />,
				label: t('settings'),
				onClick: () => setSettingsModalOpen(true),
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
				key: 'report_bug',
				icon: <BugOutlined />,
				label: tCommon('reportIssue'),
				onClick: handleBugReport,
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
				background: `color-mix(in srgb, ${token.colorBgContainer} 55%, transparent)`, // Semi-transparent for blur
				backdropFilter: 'blur(8px)',
				padding: 0, // Reset padding, will use container
				boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				height: 64,
				borderBottom: `1px solid ${token.colorBorderSecondary}`,
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
					<Image
						src="/assets/w_logo.png"
						alt="WatashiWa Logo"
						width={isXs ? 40 : 50}
						height={isXs ? 40 : 50}
						priority
					/>
					<Text
						strong
						style={{
							margin: 0,
							color: token.colorTextHeading,
							fontSize: 20,
							letterSpacing: '-0.5px',
							fontFamily: 'var(--font-geist-sans, sans-serif)', // Assuming setup
						}}
					>
						WatashiWa
					</Text>
				</Flex>

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
								separator={<div style={{ width: 1, height: 16, background: '#eee' }} />}
							>
								<LanguageSelector />
								<ThemeToggle />

								{/* Share Button (Desktop) - Enhanced Visibility */}
								<Tooltip title={t('share')}>
									<Button
										type="text"
										icon={<ShareAltOutlined style={{ fontSize: 18 }} />}
										onClick={() => setShareModalOpen(true)}
									>
										{t('share')}
									</Button>
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
											style={{ backgroundColor: token.colorPrimary }}
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
							<ThemeToggle />
							<Link href="/login">
								<Button
									type="primary"
									shape="round"
									style={{
										background: token.colorPrimary,
										padding: '0 24px',
										fontWeight: 600,
										boxShadow: `0 4px 14px 0 ${token.colorPrimary}40`,
										border: 'none',
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = 'translateY(-1px)';
										e.currentTarget.style.boxShadow = `0 6px 20px 0 ${token.colorPrimary}60`;
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = 'translateY(0)';
										e.currentTarget.style.boxShadow = `0 4px 14px 0 ${token.colorPrimary}40`;
									}}
								>
									{t('login')}
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
							<ThemeToggle />
							<LanguageSelector />
							<Link href="/login">
								<Button type="primary" size="small" style={{ background: token.colorPrimary }}>
									{t('login')}
								</Button>
							</Link>
						</Flex>
					</div>
				)}

				{/* Mobile Drawer */}
				<NavDrawer
					open={drawerOpen}
					onClose={closeDrawer}
					user={user}
					pathname={pathname}
					menuItems={menuItems}
					onShare={() => setShareModalOpen(true)}
					onBugReport={handleBugReport}
					onLogout={handleLogout}
					onOpenSettings={() => setSettingsModalOpen(true)}
				/>

				<ShareModal open={shareModalOpen} onCancel={() => setShareModalOpen(false)} />
				<SettingsModal
					open={settingsModalOpen}
					onCancel={() => setSettingsModalOpen(false)}
					user={user}
				/>
			</div>
		</Header>
	);
}
