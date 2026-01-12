'use client';

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
import { FireFilled } from '@ant-design/icons';
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
}: DesktopNavDockProps) {
	const { token } = useToken();
	const searchParams = useSearchParams();
	const t = useTranslations('NavBar');

	return (
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
				zIndex: NAVBAR_Z_INDEX,
				pointerEvents: 'none', // Let clicks pass through outside the dock
			}}
		>
			<div style={{ pointerEvents: 'auto', display: 'flex', gap: 16 }}>
				{/* LOGO & BRAND */}
				<GlassDock style={{ padding: '8px 24px' }}>
					<Link href={isPublic ? '/' : '/dashboard?app=true'}>
						<Flex align="center" gap="small" style={{ cursor: 'pointer' }}>
							<Image src={ASSET_PATHS.logo.small} alt="Logo" width={32} height={32} priority />
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
							isActive={isActiveRoute(pathname, item, searchParams)}
							isPublic={isPublic}
							isMobile={false}
						/>
					))}
				</GlassDock>

				{/* ACTIONS PILL */}
				<GlassDock>
					{!isPublic ? (
						<>
							<Flex align="center" gap={4}>
								<FireFilled style={{ color: token.colorWarning, fontSize: 16 }} />
								<Text strong>{streak}</Text>
							</Flex>
							{/* Vertical Divider */}
							<div style={{ width: 1, height: 24, background: token.colorBorderSecondary }} />

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
			</div>
		</motion.div>
	);
}
