'use client';

import ProtectedLink from '@/components/Shared/ProtectedLink';
import ShareModal from '@/modules/deck/components/ShareModal';
import { useUIStore } from '@/modules/ui/store/useUIStore';
import LanguageSelector from '@/modules/user/components/LanguageSelector';
import ThemeToggle from '@/modules/user/components/ThemeToggle';
import { createClient } from '@/utils/supabase/client';
import {
	BugOutlined,
	FireFilled,
	LogoutOutlined,
	SettingOutlined,
	ShareAltOutlined,
	UserOutlined,
} from '@ant-design/icons';
import * as Sentry from '@sentry/nextjs';
import { Avatar, Button, Drawer, Dropdown, Flex, Grid, Space, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { NAV_ITEMS, type NavItem, isProtectedRoute } from './navbar/NavConfig';
import NotificationPopover from './navbar/NotificationPopover';
import SettingsModal from './navbar/SettingsModal';

const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

// Motion Components
const MotionDiv = motion.div;

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
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Global UI Store Control
	const isNavBarVisible = useUIStore((state) => state.isNavBarVisible);
	const setNavBarVisible = useUIStore((state) => state.setNavBarVisible);

	const isXs = mounted ? screens.xs : false;

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(timer);
	}, []);

	// Check URL for settings trigger
	useEffect(() => {
		if (searchParams.get('settings') === 'true') {
			setTimeout(() => setSettingsModalOpen(true), 0);
			const params = new URLSearchParams(searchParams.toString());
			params.delete('settings');
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		}
	}, [searchParams, pathname, router]);

	// Sync navbar with URL changes (handles browser back/forward)
	useEffect(() => {
		const hasDeckId = searchParams.get('deckId');
		const hasDeckSlug = searchParams.get('deckSlug');
		const hasCourseId = searchParams.get('courseId');
		const isDashboardState =
			pathname?.startsWith('/study') && !hasDeckId && !hasDeckSlug && !hasCourseId;

		// If URL indicates dashboard but store says hidden, show navbar
		if (isDashboardState && !isNavBarVisible) {
			setNavBarVisible(true);
		}
	}, [pathname, searchParams, isNavBarVisible, setNavBarVisible]);

	const t = useTranslations('NavBar');
	const tCommon = useTranslations('Common');

	const handleBugReport = async () => {
		const feedback = Sentry.getFeedback();
		if (feedback) {
			const form = await feedback.createForm();
			form.appendToDom();
			form.open();
		}
	};

	const handleLogout = async () => {
		// Clear login method cache on logout
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('watashi_login_methods');
			} catch (error) {
				console.error('[NavBar] Failed to clear login cache:', error);
			}
		}
		await supabase.auth.signOut();
		router.push('/login');
		router.refresh();
	};

	// Determine if user is public (not authenticated)
	const isPublic = !user;

	// Dark theme detection for conditional styling
	const isDark = token.colorBgBase === '#151F32';

	/**
	 * Handle navigation clicks with smart redirect for public users
	 * If route is protected and user is public, redirect to login with returnUrl
	 */
	const handleNavClick = useCallback(
		(path: string, e?: React.MouseEvent) => {
			if (e) {
				e.preventDefault();
			}

			// Validate path before processing
			if (!path || typeof path !== 'string' || path.trim() === '') {
				console.warn('[NavBar] Invalid path provided to handleNavClick:', path);
				return;
			}

			// If public user clicks protected route, redirect to login with returnUrl
			if (isPublic && isProtectedRoute(path)) {
				// Encode the path to safely pass as query parameter
				const returnUrl = encodeURIComponent(path);
				router.push(`/login?returnUrl=${returnUrl}`);
			} else {
				router.push(path);
			}
		},
		[isPublic, router],
	);

	// // Smart Scroll Logic
	// useMotionValueEvent(scrollY, 'change', (latest) => {
	// 	const previous = lastScrollY;
	// 	if (latest > previous && latest > 150) {
	// 		setIsHidden(true); // Scroll Down -> Hide
	// 	} else {
	// 		setIsHidden(false); // Scroll Up -> Show
	// 	}
	// 	setLastScrollY(latest);
	// });

	// 1. Route-based hiding (Hard Rules)
	// Check if we're in an active study session (has deckId/courseId)
	const hasDeckId = searchParams.get('deckId');
	const hasDeckSlug = searchParams.get('deckSlug');
	const hasCourseId = searchParams.get('courseId');
	const isActiveStudySession =
		pathname?.startsWith('/study') && (hasDeckId || hasDeckSlug || hasCourseId);

	// Hide navbar on auth pages (login, forgot-password, reset-password)
	// These are focused flows that should not have navigation distractions
	const isAuthPage =
		pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';

	if (
		isAuthPage ||
		isActiveStudySession || // Only hide during active session, not dashboard
		pathname === '/exercises' ||
		pathname?.startsWith('/admin')
	) {
		return null;
	}

	// 2. Variable hiding (Store Control) - e.g. Focus Mode
	if (!isNavBarVisible) {
		return null;
	}

	const userMenuProps: MenuProps = {
		items: [
			{
				key: 'email',
				label: (
					<Flex vertical gap={2} style={{ padding: '4px 0' }}>
						<Text strong style={{ fontSize: 13 }}>
							{t('greeting', { name: user?.user_metadata?.full_name || t('guest') })}
						</Text>
						<Text type="secondary" style={{ fontSize: 11 }}>
							{user?.email}
						</Text>
					</Flex>
				),
				disabled: true,
				style: { cursor: 'default', opacity: 1 },
			},
			{ type: 'divider' },
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
				onClick: () => setShareModalOpen(true),
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

	// --- RENDER HELPERS ---

	const GlassDock = ({
		children,
		style,
	}: {
		children: React.ReactNode;
		style?: React.CSSProperties;
	}) => {
		// Dark theme aware shadow
		const shadowColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';

		return (
			<div
				style={{
					background: `color-mix(in srgb, ${token.colorBgContainer} 80%, transparent)`,
					backdropFilter: 'blur(16px)',
					borderRadius: '24px',
					border: `1px solid ${token.colorBorderSecondary}`,
					boxShadow: `0 8px 32px ${shadowColor}`,
					padding: '8px 16px',
					display: 'flex',
					alignItems: 'center',
					gap: '16px',
					transition: 'transform 0.3s ease',
					...style,
				}}
			>
				{children}
			</div>
		);
	};

	const NavDockItem = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
		const [isHovered, setIsHovered] = useState(false);

		return (
			<ProtectedLink href={item.path} isPublic={isPublic} prefetch={true}>
				<MotionDiv
					onHoverStart={() => setIsHovered(true)}
					onHoverEnd={() => setIsHovered(false)}
					animate={{ scale: isHovered ? 1.1 : 1 }}
					transition={{ type: 'spring', stiffness: 400, damping: 17 }}
					style={{
						position: 'relative',
						padding: '8px 16px',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 4,
					}}
				>
					<div
						style={{
							fontSize: 20,
							color: isActive ? token.colorPrimary : token.colorTextSecondary,
							transition: 'color 0.3s',
						}}
					>
						{item.icon}
					</div>
					{!isXs && (
						<Text
							style={{
								fontSize: 12,
								fontWeight: isActive ? 600 : 400,
								color: isActive ? token.colorPrimary : token.colorTextSecondary,
							}}
						>
							{t(item.key as keyof typeof t)}
						</Text>
					)}
					{isActive && (
						<MotionDiv
							layoutId="activeTab"
							style={{
								position: 'absolute',
								bottom: -4,
								width: '12px',
								height: '4px',
								borderRadius: '2px',
								backgroundColor: token.colorPrimary,
							}}
						/>
					)}
				</MotionDiv>
			</ProtectedLink>
		);
	};

	return (
		<>
			{/* 1. SPACER to prevent overlap content */}
			{!isXs && <div style={{ height: 100, width: '100%' }} />}
			{isXs && <div style={{ height: 60, width: '100%' }} />}

			{/* DESKTOP TOP DOCK */}
			{!isXs && (
				<motion.div
					initial={{ y: -100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					style={{
						position: 'fixed',
						top: 24,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						zIndex: 1000,
						pointerEvents: 'none', // Let clicks pass through outside the dock
					}}
				>
					<div style={{ pointerEvents: 'auto', display: 'flex', gap: 16 }}>
						{/* LOGO & BRAND */}
						<GlassDock style={{ padding: '8px 24px' }}>
							<Link href="/">
								<Flex align="center" gap="small" style={{ cursor: 'pointer' }}>
									<Image src="/assets/w_logo.png" alt="Logo" width={32} height={32} />
									<Text strong style={{ fontSize: 16, letterSpacing: '-0.5px' }}>
										WatashiWa
									</Text>
								</Flex>
							</Link>
						</GlassDock>

						{/* MAIN NAV PILL (The "Dock") - Now visible to all users */}
						<GlassDock style={{ gap: 8 }}>
							{NAV_ITEMS.map((item) => (
								<NavDockItem
									key={item.key}
									item={item}
									isActive={
										item.path === '/'
											? pathname === '/'
											: pathname.startsWith(item.path) && item.path !== '/'
									}
								/>
							))}
						</GlassDock>

						{/* ACTIONS PILL */}
						<GlassDock>
							{!isPublic ? (
								<>
									<Flex align="center" gap={4}>
										<FireFilled style={{ color: token.colorWarning, fontSize: 16 }} />
										<Text strong>12</Text>
									</Flex>
									{/* Vertical Divider */}
									<div style={{ width: 1, height: 24, background: token.colorBorderSecondary }} />

									<Space size={8}>
										{/* Restored Settings Controls */}
										<LanguageSelector />
										<ThemeToggle />

										{/* <Tooltip title={t('share')}>
											<Button
												type="text"
												icon={<ShareAltOutlined />}
												onClick={() => setShareModalOpen(true)}
											/>
										</Tooltip> */}

										<NotificationPopover />
										<Dropdown menu={userMenuProps} trigger={['click']} placement="bottomRight">
											<Avatar
												src={user?.user_metadata?.avatar_url}
												style={{
													backgroundColor: token.colorPrimary,
													cursor: 'pointer',
													border: `2px solid ${token.colorBgContainer}`,
												}}
												icon={<UserOutlined />}
											/>
										</Dropdown>
									</Space>
								</>
							) : (
								<Flex gap="small">
									<LanguageSelector />
									<ThemeToggle />
									<Link href="/login">
										<Button type="primary" shape="round">
											{t('loginStart')}
										</Button>
									</Link>
								</Flex>
							)}
						</GlassDock>
					</div>
				</motion.div>
			)}

			{/* MOBILE BOTTOM BAR (Instagram Style Glass) */}
			{isXs && (
				<>
					{/* Top Logo Bar */}
					<motion.div
						initial={{ y: -100 }}
						animate={{ y: 0 }}
						transition={{ duration: 0.3 }}
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							padding: '12px 16px',
							background: `color-mix(in srgb, ${token.colorBgContainer} 80%, transparent)`,
							backdropFilter: 'blur(16px)',
							zIndex: 1000,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							borderBottom: `1px solid ${token.colorBorderSecondary}`,
						}}
					>
						<div style={{ position: 'relative', height: 28, width: 28 }}>
							<Link href="/">
								<Image src="/assets/w_logo.png" alt="Logo" width={28} height={28} />
							</Link>
						</div>

						{/* Center: The HOOK (Streak) */}
						{!isPublic && (
							<Flex
								align="center"
								gap={4}
								style={{
									position: 'absolute',
									left: '50%',
									transform: 'translateX(-50%)',
								}}
							>
								<FireFilled style={{ color: token.colorWarning, fontSize: 18 }} />
								<Text strong style={{ fontSize: 16 }}>
									12
								</Text>
							</Flex>
						)}

						<Space size="small">
							{/* Right: Actions */}
							{!isPublic && <NotificationPopover />}
							<Avatar
								size="small"
								src={user?.user_metadata?.avatar_url}
								style={{
									backgroundColor: token.colorPrimary,
									cursor: 'pointer',
									opacity: isPublic ? 0.6 : 1,
								}}
								icon={<UserOutlined />}
								onClick={() => setMobileDrawerOpen(true)}
							/>
						</Space>
					</motion.div>

					{/* Bottom Navigation Dock - Now visible to all users */}
					<motion.div
						initial={{ y: 100 }}
						animate={{ y: 0 }}
						transition={{ duration: 0.3 }}
						style={{
							position: 'fixed',
							bottom: 0,
							left: 0,
							right: 0,
							padding: '12px clamp(16px, 4vw, 24px) clamp(20px, 5vw, 24px) clamp(20px, 5vw, 24px)', // Responsive padding with extra bottom for iOS Home Indicator
							background: `color-mix(in srgb, ${token.colorBgContainer} 90%, transparent)`,
							backdropFilter: 'blur(16px)',
							zIndex: 1000,
							display: 'flex',
							justifyContent: 'space-between',
							borderTop: `1px solid ${token.colorBorderSecondary}`,
							boxShadow:
								token.colorBgBase === '#151F32'
									? '0 -4px 20px rgba(0,0,0,0.3)'
									: '0 -4px 20px rgba(0,0,0,0.05)',
						}}
					>
						{NAV_ITEMS.map((item) => {
							const isActive =
								item.path === '/'
									? pathname === '/'
									: pathname.startsWith(item.path) && item.path !== '/';

							return (
								<ProtectedLink
									key={item.key}
									href={item.path}
									isPublic={isPublic}
									prefetch={true}
									style={{ flex: 1, cursor: 'pointer' }}
								>
									<Flex vertical align="center" gap={4}>
										<div
											style={{
												fontSize: 'clamp(20px, 5vw, 22px)', // Responsive icon size
												color: isActive ? token.colorPrimary : token.colorTextTertiary,
												transition: 'all 0.3s',
												transform: isActive ? 'scale(1.1)' : 'scale(1)',
											}}
										>
											{item.icon}
										</div>
									</Flex>
								</ProtectedLink>
							);
						})}
					</motion.div>
				</>
			)}

			<ShareModal open={shareModalOpen} onCancel={() => setShareModalOpen(false)} />
			<SettingsModal
				open={settingsModalOpen}
				onCancel={() => setSettingsModalOpen(false)}
				user={user}
			/>

			{/* MOBILE MENU DRAWER */}
			<Drawer
				placement="bottom"
				closable={false}
				onClose={() => setMobileDrawerOpen(false)}
				open={mobileDrawerOpen}
				size="default"
				styles={{
					body: {
						padding: 'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 16px)',
						height: '100%',
						overflowY: 'auto',
					},
					mask: { backdropFilter: 'blur(4px)' },
				}}
				style={{
					background: token.colorBgContainer,
					borderTopLeftRadius: 24,
					borderTopRightRadius: 24,
				}}
			>
				{isPublic ? (
					/* Public User Drawer */
					<Flex
						vertical
						gap={'middle'}
						align="center"
						style={{ padding: 'clamp(20px, 5vw, 24px) 0' }}
					>
						<Avatar
							size={64}
							icon={<UserOutlined />}
							style={{
								backgroundColor: token.colorPrimary,
								border: `4px solid ${token.colorBgLayout}`,
							}}
						/>
						<div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 5vw, 24px)' }}>
							<Text
								strong
								style={{
									fontSize: 'clamp(18px, 4vw, 20px)',
									display: 'block',
									marginBottom: 8,
									color: token.colorText,
								}}
							>
								{t('signUpToAccess')}
							</Text>
							<Text
								type="secondary"
								style={{
									fontSize: 'clamp(12px, 3vw, 14px)',
									color: token.colorTextSecondary,
								}}
							>
								{t('signUpToAccessDesc')}
							</Text>
						</div>
						<Link href="/login" prefetch={true} onClick={() => setMobileDrawerOpen(false)}>
							<Button
								type="primary"
								size="large"
								block
								style={{
									marginBottom: 12,
									height: 'clamp(44px, 10vw, 48px)',
									fontSize: 'clamp(14px, 3.5vw, 16px)',
								}}
							>
								{t('loginStart')}
							</Button>
						</Link>
						<Button
							type="text"
							size="large"
							icon={<BugOutlined />}
							block
							onClick={() => {
								setMobileDrawerOpen(false);
								handleBugReport();
							}}
							style={{
								height: 'clamp(44px, 10vw, 48px)',
								fontSize: 'clamp(14px, 3.5vw, 16px)',
								color: token.colorText,
							}}
						>
							{tCommon('reportIssue')}
						</Button>
					</Flex>
				) : (
					/* Authenticated User Drawer */
					<Flex vertical gap={'middle'}>
						{/* 1. Header: Identity */}
						<Flex vertical align="center" gap="small">
							<Avatar
								size={64}
								src={user?.user_metadata?.avatar_url}
								icon={<UserOutlined />}
								style={{ border: `4px solid ${token.colorBgLayout}` }}
							/>
							<div style={{ textAlign: 'center' }}>
								<Text strong style={{ fontSize: 18, display: 'block' }}>
									{user?.user_metadata?.full_name || t('guest')}
								</Text>
								<Text type="secondary" style={{ fontSize: 14 }}>
									{user?.email}
								</Text>
							</div>
						</Flex>

						<div style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }} />

						{/* 2. Actions: Utility */}
						<Flex vertical gap="small">
							<Button
								block
								size="large"
								icon={<SettingOutlined />}
								style={{
									justifyContent: 'flex-start',
									paddingLeft: 'clamp(20px, 5vw, 24px)',
									fontSize: 'clamp(14px, 3.5vw, 16px)',
									height: 'clamp(44px, 10vw, 48px)',
									color: token.colorText,
								}}
								onClick={() => {
									setMobileDrawerOpen(false);
									setSettingsModalOpen(true);
								}}
							>
								{t('settings')}
							</Button>
							<Button
								block
								size="large"
								icon={<ShareAltOutlined />}
								style={{
									justifyContent: 'flex-start',
									paddingLeft: 'clamp(20px, 5vw, 24px)',
									fontSize: 'clamp(14px, 3.5vw, 16px)',
									height: 'clamp(44px, 10vw, 48px)',
									color: token.colorText,
								}}
								onClick={() => {
									setMobileDrawerOpen(false);
									setShareModalOpen(true);
								}}
							>
								{t('share')}
							</Button>
							<Button
								block
								size="large"
								icon={<BugOutlined />}
								style={{
									justifyContent: 'flex-start',
									paddingLeft: 'clamp(20px, 5vw, 24px)',
									fontSize: 'clamp(14px, 3.5vw, 16px)',
									height: 'clamp(44px, 10vw, 48px)',
									color: token.colorText,
								}}
								onClick={() => {
									setMobileDrawerOpen(false);
									handleBugReport();
								}}
							>
								{tCommon('reportIssue')}
							</Button>
						</Flex>

						{/* 3. Exit: Logout */}
						<Flex
							style={{
								justifyContent: 'flex-end',
								boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
								padding: 8,
							}}
						>
							<Button danger icon={<LogoutOutlined />} onClick={handleLogout} />
						</Flex>
					</Flex>
				)}
			</Drawer>
		</>
	);
}
