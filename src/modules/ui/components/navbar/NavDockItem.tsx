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

	return (
		<ProtectedLink href={item.path} isPublic={isPublic} prefetch={true}>
			<MotionDiv
				onHoverStart={() => setIsHovered(true)}
				onHoverEnd={() => setIsHovered(false)}
				animate={{ scale: isHovered ? 1.1 : 1 }}
				transition={{ type: 'spring', stiffness: 400, damping: 17 }}
				role="link"
				aria-label={t(item.key as keyof typeof t)}
				aria-current={isActive ? 'page' : undefined}
				tabIndex={0}
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
						fontSize: isMobile ? 'clamp(20px, 5vw, 22px)' : 20,
						color: isActive ? token.colorPrimary : token.colorTextSecondary,
						transition: 'color 0.3s',
					}}
				>
					{item.icon}
				</div>
				{!isMobile && (
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
				{isActive && !isMobile && (
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
}

export default memo(NavDockItem);
