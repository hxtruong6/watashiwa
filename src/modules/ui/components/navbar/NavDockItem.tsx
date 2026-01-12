'use client';

import ProtectedLink from '@/modules/ui/components/ProtectedLink';
import type { NavItem } from '@/modules/ui/components/navbar/NavConfig';
import { Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React, { memo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

const MotionDiv = motion.div;

interface NavDockItemProps {
	item: NavItem;
	isActive: boolean;
	isPublic: boolean;
	isMobile: boolean;
}

/**
 * NavDockItem Component
 * Reusable navigation item with hover animations and active state indicator
 */
function NavDockItem({ item, isActive, isPublic, isMobile }: NavDockItemProps) {
	const [isHovered, setIsHovered] = useState(false);
	const { token } = useToken();
	const t = useTranslations('NavBar');
	const isDark = token.colorBgBase === '#151F32';

	return (
		<ProtectedLink href={item.path} isPublic={isPublic} prefetch={true}>
			<MotionDiv
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
				animate={{
					scale: isHovered ? 1.08 : isActive ? 1.02 : 1,
					y: isHovered ? -2 : 0,
				}}
				transition={{
					type: 'spring',
					stiffness: 500,
					damping: 30,
					mass: 0.5,
				}}
				role="link"
				aria-label={t(item.key as keyof typeof t)}
				aria-current={isActive ? 'page' : undefined}
				tabIndex={0}
				style={{
					position: 'relative',
					padding: isMobile ? '8px' : '6px 16px',
					cursor: 'pointer',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 3,
					borderRadius: '12px',
					minHeight: isMobile ? 'auto' : '48px', // Standardized height
					height: isMobile ? 'auto' : '48px',
					// Enhanced glass button for active items (desktop)
					...(isActive &&
						!isMobile && {
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
								? `0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`
								: `0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
						}),
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				<motion.div
					animate={{
						scale: isActive ? 1.1 : 1,
						rotate: isHovered ? (isActive ? 0 : 5) : 0,
					}}
					transition={{
						type: 'spring',
						stiffness: 400,
						damping: 20,
					}}
					style={{
						fontSize: isMobile ? 'clamp(20px, 5vw, 22px)' : 18, // Reduced from 20px to 18px
						color: isActive ? token.colorPrimary : token.colorTextSecondary,
						transition: 'color 0.3s',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{item.icon}
				</motion.div>
				{!isMobile && (
					<motion.div
						animate={{
							opacity: isActive ? 1 : 0.7,
							y: isActive ? 0 : 2,
						}}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					>
						<Text
							style={{
								fontSize: 11, // Reduced from 12px to 11px
								lineHeight: 1.2,
								fontWeight: isActive ? 600 : 400,
								color: isActive ? token.colorPrimary : token.colorTextSecondary,
								transition: 'all 0.3s',
							}}
						>
							{t(item.key as keyof typeof t)}
						</Text>
					</motion.div>
				)}
				{isActive && !isMobile && (
					<MotionDiv
						layoutId="activeTab"
						initial={false}
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
						style={{
							position: 'absolute',
							bottom: -4,
							width: '12px',
							height: '4px',
							borderRadius: '2px',
							backgroundColor: token.colorPrimary,
							boxShadow: `0 0 8px ${token.colorPrimary}40`,
						}}
					/>
				)}
			</MotionDiv>
		</ProtectedLink>
	);
}

export default memo(NavDockItem);
