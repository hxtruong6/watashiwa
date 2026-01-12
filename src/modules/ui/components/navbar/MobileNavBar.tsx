'use client';

import { ASSET_PATHS } from '@/lib/seo/constants';
import ProtectedLink from '@/modules/ui/components/ProtectedLink';
import { NAV_ITEMS } from '@/modules/ui/components/navbar/NavConfig';
import NotificationPopover from '@/modules/ui/components/navbar/NotificationPopover';
import type { NavBarUser } from '@/modules/ui/components/navbar/types';
import { NAVBAR_Z_INDEX, isActiveRoute } from '@/modules/ui/components/navbar/useNavBarConstants';
import { FireFilled, UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Space, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface MobileNavBarProps {
	user: NavBarUser;
	streak: number;
	isPublic: boolean;
	pathname: string;
	onDrawerOpen: () => void;
}

/**
 * MobileNavBar Component
 * Mobile top bar and bottom navigation dock
 */
export default function MobileNavBar({
	user,
	streak,
	isPublic,
	pathname,
	onDrawerOpen,
}: MobileNavBarProps) {
	const { token } = useToken();
	const searchParams = useSearchParams();

	return (
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
					zIndex: NAVBAR_Z_INDEX,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					borderBottom: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				<div style={{ position: 'relative', height: 28, width: 28 }}>
					<Link href={isPublic ? '/' : '/dashboard?app=true'}>
						<Image src={ASSET_PATHS.logo.small} alt="Logo" width={28} height={28} priority />
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
							{streak}
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
						onClick={onDrawerOpen}
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
					zIndex: NAVBAR_Z_INDEX,
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
					const isActive = isActiveRoute(pathname, item, searchParams);

					return (
						<ProtectedLink
							key={item.key}
							href={item.path}
							isPublic={isPublic}
							prefetch={true}
							style={{ flex: 1, cursor: 'pointer' }}
							aria-label={item.label}
							aria-current={isActive ? 'page' : undefined}
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
	);
}
