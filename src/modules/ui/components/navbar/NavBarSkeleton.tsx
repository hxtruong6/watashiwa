'use client';

import { Flex, Grid, Skeleton, Space, theme } from 'antd';
import React from 'react';

const { useToken } = theme;
const { useBreakpoint } = Grid;

/**
 * GlassDock helper component for skeleton styling
 * Matches NavBar's glass dock appearance
 */
function GlassDock({
	children,
	style,
	token,
	shadowColor,
}: {
	children: React.ReactNode;
	style?: React.CSSProperties;
	token: ReturnType<typeof useToken>['token'];
	shadowColor: string;
}) {
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
				...style,
			}}
		>
			{children}
		</div>
	);
}

/**
 * NavBarSkeleton Component
 * Provides a loading skeleton that matches the NavBar structure
 * Supports both desktop and mobile layouts
 */
export default function NavBarSkeleton() {
	const { token } = useToken();
	const screens = useBreakpoint();
	const isXs = screens.xs ?? false;

	// Dark theme detection for conditional styling
	const isDark = token.colorBgBase === '#151F32';
	const shadowColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';

	return (
		<>
			{/* Spacer to prevent content overlap */}
			{!isXs && <div style={{ height: 110, width: '100%', background: token.colorBgLayout }} />}
			{isXs && <div style={{ height: 60, width: '100%', background: token.colorBgLayout }} />}

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
						zIndex: 1000,
						pointerEvents: 'none',
					}}
				>
					<div style={{ pointerEvents: 'auto', display: 'flex', gap: 16 }}>
						{/* LOGO & BRAND SKELETON */}
						<GlassDock style={{ padding: '8px 24px' }} token={token} shadowColor={shadowColor}>
							<Flex align="center" gap="small">
								<Skeleton.Avatar active size={32} shape="square" />
								<Skeleton.Input active size="small" style={{ width: 100, height: 20 }} />
							</Flex>
						</GlassDock>

						{/* MAIN NAV PILL SKELETON (4 navigation items) */}
						<GlassDock style={{ gap: 8 }} token={token} shadowColor={shadowColor}>
							{Array.from({ length: 4 }).map((_, index) => (
								<Flex key={index} vertical align="center" gap={4} style={{ padding: '8px 16px' }}>
									<Skeleton.Avatar active size={20} shape="circle" />
									<Skeleton.Input active size="small" style={{ width: 60, height: 12 }} />
								</Flex>
							))}
						</GlassDock>

						{/* ACTIONS PILL SKELETON */}
						<GlassDock token={token} shadowColor={shadowColor}>
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
							zIndex: 1000,
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
							zIndex: 1000,
							display: 'flex',
							justifyContent: 'space-between',
							borderTop: `1px solid ${token.colorBorderSecondary}`,
							boxShadow: isDark ? '0 -4px 20px rgba(0,0,0,0.3)' : '0 -4px 20px rgba(0,0,0,0.05)',
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
