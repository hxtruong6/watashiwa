'use client';

import GlassDock from '@/modules/ui/components/navbar/GlassDock';
import {
	NAVBAR_SPACER_DESKTOP,
	NAVBAR_SPACER_MOBILE,
	NAVBAR_Z_INDEX,
} from '@/modules/ui/components/navbar/useNavBarConstants';
import { useResponsiveBreakpoint } from '@/modules/ui/components/navbar/useResponsiveBreakpoint';
import { Flex, Skeleton, Space, theme } from 'antd';
import React from 'react';

const { useToken } = theme;

/**
 * NavBarSkeleton Component
 * Provides a loading skeleton that matches the NavBar structure
 * Supports both desktop and mobile layouts
 * Uses shared components and constants for consistency
 */
export default function NavBarSkeleton() {
	const { token } = useToken();
	const isXs = useResponsiveBreakpoint();

	return (
		<>
			{/* Spacer to prevent content overlap */}
			{!isXs && (
				<div
					style={{ height: NAVBAR_SPACER_DESKTOP, width: '100%', background: token.colorBgLayout }}
				/>
			)}
			{isXs && (
				<div
					style={{ height: NAVBAR_SPACER_MOBILE, width: '100%', background: token.colorBgLayout }}
				/>
			)}

			{/* DESKTOP TOP DOCK */}
			{!isXs && (
				<div
					style={{
						position: 'fixed',
						top: 24,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						zIndex: NAVBAR_Z_INDEX,
						pointerEvents: 'none',
					}}
				>
					<div style={{ pointerEvents: 'auto', display: 'flex', gap: 16 }}>
						{/* LOGO & BRAND SKELETON */}
						<GlassDock style={{ padding: '8px 24px' }}>
							<Flex align="center" gap="small">
								<Skeleton.Avatar active size={32} shape="square" />
								<Skeleton.Input active size="small" style={{ width: 100, height: 20 }} />
							</Flex>
						</GlassDock>

						{/* MAIN NAV PILL SKELETON (4 navigation items) */}
						<GlassDock style={{ gap: 8 }}>
							{Array.from({ length: 4 }).map((_, index) => (
								<Flex key={index} vertical align="center" gap={4} style={{ padding: '8px 16px' }}>
									<Skeleton.Avatar active size={20} shape="circle" />
									<Skeleton.Input active size="small" style={{ width: 60, height: 12 }} />
								</Flex>
							))}
						</GlassDock>

						{/* ACTIONS PILL SKELETON */}
						<GlassDock>
							<Space size={8}>
								{/* Streak indicator skeleton (for private users) */}
								<Skeleton.Input active size="small" style={{ width: 30, height: 16 }} />
								{/* Divider */}
								<div style={{ width: 1, height: 24, background: token.colorBorderSecondary }} />
								{/* Settings controls skeleton */}
								<Skeleton.Button active size="small" shape="circle" />
								<Skeleton.Button active size="small" shape="circle" />
								{/* Notification skeleton */}
								<Skeleton.Button active size="small" shape="circle" />
								{/* Avatar skeleton */}
								<Skeleton.Avatar active size={32} shape="circle" />
							</Space>
						</GlassDock>
					</div>
				</div>
			)}

			{/* MOBILE LAYOUT */}
			{isXs && (
				<>
					{/* Top Logo Bar Skeleton */}
					<div
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
						{/* Logo skeleton */}
						<Skeleton.Avatar active size={28} shape="square" />

						{/* Center: Streak indicator skeleton (for private users) */}
						<Flex
							align="center"
							gap={4}
							style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
						>
							<Skeleton.Input active size="small" style={{ width: 24, height: 16 }} />
						</Flex>

						{/* Right: Actions skeleton */}
						<Space size="small">
							<Skeleton.Button active size="small" shape="circle" />
							<Skeleton.Avatar active size={24} shape="circle" />
						</Space>
					</div>

					{/* Bottom Navigation Dock Skeleton */}
					<div
						style={{
							position: 'fixed',
							bottom: 0,
							left: 0,
							right: 0,
							padding: '12px clamp(16px, 4vw, 24px) clamp(20px, 5vw, 24px) clamp(20px, 5vw, 24px)',
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
						{/* 4 navigation items skeleton */}
						{Array.from({ length: 4 }).map((_, index) => (
							<Flex key={index} vertical align="center" gap={4} style={{ flex: 1 }}>
								<Skeleton.Avatar active size={22} shape="circle" />
							</Flex>
						))}
					</div>
				</>
			)}
		</>
	);
}
