'use client';

import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ASSET_PATHS } from '@/lib/seo/constants';
import ProtectedLink from '@/modules/ui/components/ProtectedLink';
import { NAV_ITEMS } from '@/modules/ui/components/navbar/NavConfig';
import NotificationPopover from '@/modules/ui/components/navbar/NotificationPopover';
import type { NavBarUser } from '@/modules/ui/components/navbar/types';
import { NAVBAR_Z_INDEX, isActiveRoute } from '@/modules/ui/components/navbar/useNavBarConstants';
import { FireFilled, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Typography, theme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
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
	onSearchClick?: () => void;
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
	onSearchClick,
}: MobileNavBarProps) {
	const { token } = useToken();
	const searchParams = useSearchParams();
	const isScrolled = useScrollPosition({ threshold: 50 });
	const isDark = token.colorBgBase === '#151F32';

	return (
		<>
			{/* Top Logo Bar - iOS 16 Glass Style with Split Layout */}
			<motion.div
				initial={{ y: -100 }}
				animate={{
					y: 0,
					padding: isScrolled ? '8px 12px' : '12px 16px',
					background: isScrolled
						? 'transparent' // Fully transparent when scrolled
						: `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 85 : 85}%, transparent)`, // Glass effect when at top
					borderBottom: isScrolled
						? 'none' // No border when scrolled
						: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 20%, transparent)`, // Border when at top
					boxShadow: isScrolled
						? 'none' // No shadow when scrolled
						: isDark
							? `0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`
							: `0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`, // Shadow when at top
				}}
				transition={{
					duration: 0.3,
					ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth transition
				}}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					padding: isScrolled ? '8px 12px' : '12px 16px',
					// Enhanced iOS 16 glass material - glass when at top, transparent when scrolled
					background: isScrolled
						? 'transparent' // Transparent when scrolled
						: `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 85 : 85}%, transparent)`, // Glass effect when at top
					backgroundImage: isScrolled
						? 'none'
						: token.colorBgBase === '#151F32'
							? `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
							   radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)`
							: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
							   radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
					backdropFilter: isScrolled ? 'none' : 'blur(20px) saturate(180%)',
					WebkitBackdropFilter: isScrolled ? 'none' : 'blur(20px) saturate(180%)', // Safari support
					zIndex: NAVBAR_Z_INDEX,
					display: 'flex',
					justifyContent: 'space-between', // Creates empty space between left and right sections
					alignItems: 'center',
					// Refined border with gradient effect - only when at top
					borderBottom: isScrolled
						? 'none'
						: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 20%, transparent)`,
					// Enhanced shadow for depth - only when at top
					boxShadow: isScrolled
						? 'none'
						: isDark
							? `0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`
							: `0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
					// Performance optimization
					willChange: 'transform',
					transform: 'translateZ(0)',
				}}
			>
				{/* Left Section: Logo - Aligned Left */}
				<motion.div
					animate={{
						width: isScrolled ? 32 : 36,
						height: isScrolled ? 32 : 36,
						background: isScrolled
							? `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 75 : 80}%, transparent)`
							: 'transparent',
						borderRadius: isScrolled ? '12px' : '0',
						padding: isScrolled ? '6px 8px' : '0',
					}}
					transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
					style={{
						position: 'relative',
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						// Subtle background when scrolled
						background: isScrolled
							? `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 75 : 80}%, transparent)`
							: 'transparent',
						backgroundImage: isScrolled
							? isDark
								? `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)`
								: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)`
							: 'none',
						backdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
						WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
						borderRadius: isScrolled ? '12px' : '0',
						padding: isScrolled ? '6px 8px' : '0',
						border: isScrolled
							? `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 20%, transparent)`
							: 'none',
					}}
				>
					<Link href={isPublic ? '/' : '/dashboard?app=true'}>
						<Image
							src={ASSET_PATHS.logo.small}
							alt="Logo"
							width={isScrolled ? 32 : 36}
							height={isScrolled ? 32 : 36}
							priority
						/>
					</Link>
				</motion.div>

				{/* Center: The HOOK (Streak) - Only visible when NOT scrolled, absolutely positioned */}
				<AnimatePresence>
					{!isPublic && !isScrolled && (
						<motion.div
							key="streak-center"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
							style={{
								position: 'absolute',
								left: '50%',
								transform: 'translateX(-50%)',
								pointerEvents: 'none', // Don't interfere with layout
							}}
						>
							<Flex align="center" gap={4}>
								<FireFilled style={{ color: token.colorWarning, fontSize: 20 }} />
								<Text strong style={{ fontSize: 18 }}>
									{streak}
								</Text>
							</Flex>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Middle: Empty Space - Automatically created by space-between when scrolled */}
				{/* This space is automatically created by justifyContent: 'space-between' */}

				{/* Right Section: Streak + Actions - Aligned Right when scrolled */}
				<motion.div
					animate={{
						background: isScrolled
							? `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 75 : 80}%, transparent)`
							: 'transparent',
						borderRadius: isScrolled ? '12px' : '0',
						padding: isScrolled ? '6px 10px' : '0',
					}}
					transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
					style={{
						display: 'flex',
						alignItems: 'center',
						flexShrink: 0,
						justifyContent: 'flex-end',
						gap: isScrolled ? 8 : 12,
						// Subtle background when scrolled
						background: isScrolled
							? `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 75 : 80}%, transparent)`
							: 'transparent',
						backgroundImage: isScrolled
							? isDark
								? `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)`
								: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)`
							: 'none',
						backdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
						WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
						borderRadius: isScrolled ? '12px' : '0',
						padding: isScrolled ? '6px 10px' : '0',
						border: isScrolled
							? `1px solid color-mix(in srgb, ${token.colorBorderSecondary} 20%, transparent)`
							: 'none',
					}}
				>
					{/* Streak in right section when scrolled */}
					<AnimatePresence>
						{!isPublic && isScrolled && (
							<motion.div
								key="streak-right"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{
									duration: 0.3,
									ease: [0.4, 0, 0.2, 1],
									delay: 0.05,
								}}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 4,
									minHeight: 44, // Maintain touch target
								}}
							>
								<FireFilled
									style={{
										color: token.colorWarning,
										fontSize: 18,
									}}
								/>
								<Text
									strong
									style={{
										fontSize: 16,
									}}
								>
									{streak}
								</Text>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Actions */}
					{!isPublic && <NotificationPopover />}
					<Avatar
						size={isScrolled ? 'default' : 'default'}
						src={user?.user_metadata?.avatar_url}
						style={{
							backgroundColor: token.colorPrimary,
							cursor: 'pointer',
							opacity: isPublic ? 0.6 : 1,
							minWidth: 40, // Ensure touch target (44px recommended, but 40px is acceptable)
							minHeight: 40,
							width: isScrolled ? 40 : 44,
							height: isScrolled ? 40 : 44,
						}}
						icon={<UserOutlined style={{ fontSize: isScrolled ? 18 : 20 }} />}
						onClick={onDrawerOpen}
					/>
				</motion.div>
			</motion.div>

			{/* Bottom Navigation Dock - Two Section Layout (iOS 16 Glass Style) */}
			<motion.div
				initial={{ y: 100 }}
				animate={{
					y: 0,
					padding: isScrolled ? '8px clamp(12px, 3vw, 20px)' : '12px clamp(16px, 4vw, 24px)',
				}}
				transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					padding: isScrolled ? '8px clamp(12px, 3vw, 20px)' : '12px clamp(16px, 4vw, 24px)',
					paddingBottom: `max(${isScrolled ? '8px' : '12px'}, env(safe-area-inset-bottom, 0px))`,
					zIndex: NAVBAR_Z_INDEX,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					gap: '12px',
				}}
			>
				{/* Section 1: Main Navigation (4 buttons) */}
				<motion.div
					initial={{ y: 100 }}
					animate={{
						y: 0,
						scale: isScrolled ? 0.96 : 1,
						padding: isScrolled ? '6px' : '8px',
						borderRadius: isScrolled ? '20px' : '24px',
						background: `color-mix(in srgb, ${token.colorBgContainer} ${isScrolled ? (isDark ? 92 : 96) : isDark ? 88 : 94}%, transparent)`,
						backdropFilter: isScrolled ? 'blur(32px) saturate(200%)' : 'blur(30px) saturate(200%)',
						boxShadow: isDark
							? isScrolled
								? `0 -10px 36px rgba(0, 0, 0, 0.45), 0 -2px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`
								: `0 -8px 32px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`
							: isScrolled
								? `0 -10px 36px rgba(0, 0, 0, 0.15), 0 -2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`
								: `0 -8px 32px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`,
					}}
					transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
					style={{
						flex: 1,
						display: 'flex',
						justifyContent: 'space-between',
						// Enhanced iOS 16 glass material - intensity changes based on scroll
						background: `color-mix(in srgb, ${token.colorBgContainer} ${isScrolled ? (isDark ? 92 : 96) : isDark ? 88 : 94}%, transparent)`,
						backgroundImage:
							token.colorBgBase === '#151F32'
								? `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.06) 0%, transparent 60%),
								   radial-gradient(circle at 20% 100%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)`
								: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.6) 0%, transparent 60%),
								   radial-gradient(circle at 20% 100%, rgba(255, 255, 255, 0.35) 0%, transparent 50%)`,
						backdropFilter: isScrolled ? 'blur(32px) saturate(200%)' : 'blur(30px) saturate(200%)',
						WebkitBackdropFilter: isScrolled
							? 'blur(32px) saturate(200%)'
							: 'blur(30px) saturate(200%)',
						borderRadius: isScrolled ? '20px' : '24px',
						padding: isScrolled ? '6px' : '8px',
						border: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} ${isScrolled ? 28 : 25}%, transparent)`,
						boxShadow: isDark
							? isScrolled
								? `0 -10px 36px rgba(0, 0, 0, 0.45), 0 -2px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`
								: `0 -8px 32px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`
							: isScrolled
								? `0 -10px 36px rgba(0, 0, 0, 0.15), 0 -2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`
								: `0 -8px 32px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`,
						willChange: 'transform',
						transform: 'translateZ(0)',
						scale: isScrolled ? 0.96 : 1,
					}}
				>
					{NAV_ITEMS.map((item) => {
						const isActive = isActiveRoute(pathname, item, searchParams);
						const isDark = token.colorBgBase === '#151F32';

						return (
							<ProtectedLink
								key={item.key}
								href={item.path}
								isPublic={isPublic}
								prefetch={true}
								style={{ flex: 1, cursor: 'pointer', position: 'relative' }}
								aria-label={item.label}
								aria-current={isActive ? 'page' : undefined}
							>
								<motion.div
									initial={false}
									animate={{
										scale: isActive ? 1.05 : 0.95,
										opacity: isActive ? 1 : 0.7,
										y: isActive ? -2 : 0,
									}}
									transition={{
										type: 'spring',
										stiffness: 500,
										damping: 30,
										mass: 0.5,
									}}
									style={{
										position: 'relative',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										padding: isActive
											? isScrolled
												? '6px 10px'
												: '8px 12px'
											: isScrolled
												? '6px'
												: '8px',
										borderRadius: '16px',
										// iOS 16 Glass Button for Active Items
										...(isActive && {
											background: `color-mix(in srgb, ${token.colorBgContainer} ${isDark ? 75 : 85}%, transparent)`,
											backgroundImage: isDark
												? `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
												   radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.04) 0%, transparent 60%)`
												: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.6) 0%, transparent 70%),
												   radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
											backdropFilter: 'blur(20px) saturate(180%)',
											WebkitBackdropFilter: 'blur(20px) saturate(180%)',
											border: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} ${isDark ? 30 : 25}%, transparent)`,
											boxShadow: isDark
												? `0 4px 16px rgba(0, 0, 0, 0.3), 
												   inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
												   inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)`
												: `0 4px 16px rgba(0, 0, 0, 0.1), 
												   inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
												   inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)`,
											transform: 'translateZ(0)',
											willChange: 'transform',
										}),
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
									}}
								>
									<motion.div
										animate={{
											scale: isActive ? 1.15 : 1,
											rotate: isActive ? 0 : 0,
										}}
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 20,
										}}
										style={{
											fontSize: 'clamp(20px, 5vw, 22px)',
											color: isActive ? token.colorPrimary : token.colorTextTertiary,
											transition: 'color 0.3s',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										{item.icon}
									</motion.div>
								</motion.div>
							</ProtectedLink>
						);
					})}
				</motion.div>

				{/* Section 2: Search Button (Circular, Distinct Glass) */}
				<motion.button
					initial={{ y: 100, scale: 0.8 }}
					animate={{
						y: 0,
						scale: isScrolled ? 0.93 : 1,
						width: isScrolled ? '52px' : '56px',
						height: isScrolled ? '52px' : '56px',
						background: `color-mix(in srgb, ${token.colorBgContainer} ${isScrolled ? (isDark ? 85 : 92) : isDark ? 80 : 90}%, transparent)`,
						backdropFilter: isScrolled ? 'blur(28px) saturate(200%)' : 'blur(24px) saturate(200%)',
						boxShadow: isDark
							? isScrolled
								? `0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 0 rgba(0, 0, 0, 0.12)`
								: `0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)`
							: isScrolled
								? `0 10px 28px rgba(0, 0, 0, 0.18), 0 2px 10px rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 0 rgba(0, 0, 0, 0.08)`
								: `0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)`,
					}}
					transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
					onClick={onSearchClick || (() => {})}
					whileHover={{ scale: isScrolled ? 0.98 : 1.05 }}
					whileTap={{ scale: isScrolled ? 0.9 : 0.95 }}
					style={{
						width: isScrolled ? '52px' : '56px',
						height: isScrolled ? '52px' : '56px',
						minWidth: isScrolled ? '52px' : '56px',
						minHeight: isScrolled ? '52px' : '56px',
						borderRadius: '50%',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 0,
						// Enhanced iOS 16 glass button - intensity changes based on scroll
						background: `color-mix(in srgb, ${token.colorBgContainer} ${isScrolled ? (isDark ? 85 : 92) : isDark ? 80 : 90}%, transparent)`,
						backgroundImage:
							token.colorBgBase === '#151F32'
								? `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 70%),
								   radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.06) 0%, transparent 70%)`
								: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 70%),
								   radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)`,
						backdropFilter: isScrolled ? 'blur(28px) saturate(200%)' : 'blur(24px) saturate(200%)',
						WebkitBackdropFilter: isScrolled
							? 'blur(28px) saturate(200%)'
							: 'blur(24px) saturate(200%)',
						border: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} ${isScrolled ? (isDark ? 38 : 32) : isDark ? 35 : 30}%, transparent)`,
						boxShadow: isDark
							? isScrolled
								? `0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 0 rgba(0, 0, 0, 0.12)`
								: `0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)`
							: isScrolled
								? `0 10px 28px rgba(0, 0, 0, 0.18), 0 2px 10px rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 0 rgba(0, 0, 0, 0.08)`
								: `0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)`,
						transform: 'translateZ(0)',
						willChange: 'transform',
					}}
					aria-label="Search"
				>
					<motion.div
						animate={{
							fontSize: isScrolled ? '22px' : '24px',
						}}
						transition={{ duration: 0.3 }}
					>
						<SearchOutlined
							style={{
								fontSize: isScrolled ? '22px' : '24px',
								color: token.colorText,
							}}
						/>
					</motion.div>
				</motion.button>
			</motion.div>
		</>
	);
}
