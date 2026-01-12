'use client';

import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ASSET_PATHS } from '@/lib/seo/constants';
import GlassDock from '@/modules/ui/components/navbar/GlassDock';
import { NAV_ITEMS } from '@/modules/ui/components/navbar/NavConfig';
import NavDockItem from '@/modules/ui/components/navbar/NavDockItem';
import NotificationPopover from '@/modules/ui/components/navbar/NotificationPopover';
import UserMenuDropdown from '@/modules/ui/components/navbar/UserMenuDropdown';
import type { NavBarUser } from '@/modules/ui/components/navbar/types';
import { NAVBAR_Z_INDEX, isActiveRoute } from '@/modules/ui/components/navbar/useNavBarConstants';
import LanguageSelector from '@/modules/user/components/LanguageSelector';
import ThemeToggle from '@/modules/user/components/ThemeToggle';
import { FireFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface DesktopNavDockProps {
	user: NavBarUser;
	streak: number;
	isPublic: boolean;
	pathname: string;
	userMenuOpen: boolean;
	onUserMenuOpenChange: (open: boolean) => void;
	onSettings: () => void;
	onShare: () => void;
	onBugReport: () => void;
	onLogout: () => void;
	onSearchClick?: () => void;
}

/**
 * DesktopNavDock Component
 * Desktop top dock with logo, navigation, and actions
 */
export default function DesktopNavDock({
	user,
	streak,
	isPublic,
	pathname,
	userMenuOpen,
	onUserMenuOpenChange,
	onSettings,
	onShare,
	onBugReport,
	onLogout,
	onSearchClick,
}: DesktopNavDockProps) {
	const { token } = useToken();
	const searchParams = useSearchParams();
	const t = useTranslations('NavBar');
	const isScrolled = useScrollPosition({ threshold: 50 });
	const isDark = token.colorBgBase === '#151F32';

	return (
		<motion.div
			initial={{ y: -100, opacity: 0 }}
			animate={{
				y: 0,
				opacity: 1,
				top: isScrolled ? 8 : 24,
				scale: isScrolled ? 0.95 : 1,
			}}
			transition={{
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth transition
			}}
			style={{
				position: 'fixed',
				top: isScrolled ? 8 : 24, // Returns to 24px when scrolling back to top
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				zIndex: NAVBAR_Z_INDEX,
				pointerEvents: 'none', // Let clicks pass through outside the dock
			}}
		>
			<motion.div
				animate={{
					gap: isScrolled ? 12 : 16,
				}}
				transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
				style={{
					pointerEvents: 'auto',
					display: 'flex',
					gap: isScrolled ? 12 : 16,
					alignItems: 'center',
				}}
			>
				{/* LOGO & BRAND */}
				<GlassDock
					intensity={isScrolled ? 'strong' : 'medium'}
					style={{
						padding: isScrolled ? '10px 20px' : '10px 24px', // Standardized to 10px top/bottom for 48px height
						minHeight: '48px',
						height: '48px',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Link href={isPublic ? '/' : '/dashboard?app=true'}>
						<motion.div
							animate={{
								scale: isScrolled ? 0.95 : 1,
							}}
							transition={{ duration: 0.3 }}
						>
							<Flex align="center" gap="small" style={{ cursor: 'pointer', height: '100%' }}>
								<Image
									src={ASSET_PATHS.logo.small}
									alt="Logo"
									width={isScrolled ? 24 : 28}
									height={isScrolled ? 24 : 28}
									priority
									style={{
										objectFit: 'contain',
									}}
								/>
								<motion.div
									animate={{
										fontSize: isScrolled ? 13 : 15,
									}}
									transition={{ duration: 0.3 }}
									style={{
										lineHeight: 1.2,
									}}
								>
									<Text strong style={{ letterSpacing: '-0.5px', margin: 0 }}>
										WatashiWa
									</Text>
								</motion.div>
							</Flex>
						</motion.div>
					</Link>
				</GlassDock>

				{/* MAIN NAV PILL (The "Dock") */}
				<GlassDock
					intensity={isScrolled ? 'strong' : 'medium'}
					style={{
						gap: 8,
						padding: isScrolled ? '0px 12px' : '0px 16px', // Remove vertical padding, let NavDockItem handle it
						minHeight: '60px',
						height: '60px',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{NAV_ITEMS.map((item) => (
						<NavDockItem
							key={item.key}
							item={item}
							isActive={isActiveRoute(pathname, item, searchParams)}
							isPublic={isPublic}
							isMobile={false}
						/>
					))}
				</GlassDock>

				{/* SEARCH BUTTON (Separate Glass Button) */}
				<motion.button
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{
						scale: isScrolled ? 0.94 : 1,
						opacity: 1,
						width: isScrolled ? '46px' : '48px',
						height: isScrolled ? '46px' : '48px',
					}}
					whileHover={{ scale: isScrolled ? 0.98 : 1.05 }}
					whileTap={{ scale: isScrolled ? 0.9 : 0.95 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					onClick={onSearchClick || (() => {})}
					style={{
						width: isScrolled ? '46px' : '48px',
						height: isScrolled ? '46px' : '48px',
						minWidth: isScrolled ? '46px' : '48px',
						minHeight: isScrolled ? '46px' : '48px',
						borderRadius: '50%',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 0,
						// Enhanced iOS 16 glass button - stronger when scrolled
						background: `color-mix(in srgb, ${token.colorBgContainer} ${isScrolled ? (isDark ? 85 : 92) : isDark ? 80 : 90}%, transparent)`,
						backgroundImage:
							token.colorBgBase === '#151F32'
								? `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 70%),
								   radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.06) 0%, transparent 70%)`
								: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 70%),
								   radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)`,
						backdropFilter: 'blur(24px) saturate(200%)',
						WebkitBackdropFilter: 'blur(24px) saturate(200%)',
						border: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} ${token.colorBgBase === '#151F32' ? 35 : 30}%, transparent)`,
						boxShadow:
							token.colorBgBase === '#151F32'
								? `0 8px 24px rgba(0, 0, 0, 0.4), 
								   0 2px 8px rgba(0, 0, 0, 0.3),
								   inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
								   inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)`
								: `0 8px 24px rgba(0, 0, 0, 0.15), 
								   0 2px 8px rgba(0, 0, 0, 0.1),
								   inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
								   inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)`,
						willChange: 'transform',
					}}
					aria-label="Search"
				>
					<SearchOutlined
						style={{
							fontSize: isScrolled ? '18px' : '20px',
							color: token.colorText,
						}}
					/>
				</motion.button>

				{/* ACTIONS PILL */}
				<GlassDock
					intensity={isScrolled ? 'strong' : 'medium'}
					style={{
						padding: isScrolled ? '10px 16px' : '10px 16px', // Standardized to 10px top/bottom for 48px height
						minHeight: '48px',
						height: '48px',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{!isPublic ? (
						<>
							<Flex align="center" gap={4}>
								<FireFilled style={{ color: token.colorWarning, fontSize: 18 }} />
								<Text strong style={{ fontSize: 14 }}>
									{streak}
								</Text>
							</Flex>
							{/* Vertical Divider */}
							<div style={{ width: 1, height: 28, background: token.colorBorderSecondary }} />

							<Space size={8}>
								{/* Restored Settings Controls */}
								<LanguageSelector />
								<ThemeToggle />

								<NotificationPopover />
								<UserMenuDropdown
									user={user}
									open={userMenuOpen}
									onOpenChange={onUserMenuOpenChange}
									onSettings={onSettings}
									onShare={onShare}
									onBugReport={onBugReport}
									onLogout={onLogout}
								/>
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
			</motion.div>
		</motion.div>
	);
}
