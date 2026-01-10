'use client';

import { Card, Flex, Skeleton, Space, theme } from 'antd';
import type { SkeletonProps } from 'antd';
import React from 'react';

const { useToken } = theme;

/**
 * AppSkeleton - Shared skeleton component system for WatashiWa
 *
 * Design Philosophy: "Zen Mastery" - Clean, minimal, smooth animations
 * - Theme-aware (light/dark mode compatible)
 * - Mobile-first responsive design
 * - Smooth animations (≥200ms ease-out)
 * - Uses Ant Design tokens for consistency
 *
 * @example
 * // Page skeleton (default)
 * <AppSkeleton />
 *
 * // Card skeleton
 * <AppSkeleton variant="card" />
 *
 * // List skeleton
 * <AppSkeleton variant="list" count={3} />
 *
 * // Custom skeleton
 * <AppSkeleton variant="custom" rows={4} />
 */
export interface AppSkeletonProps {
	/**
	 * Skeleton variant type
	 * - `page`: Full page loading (default, 8 rows)
	 * - `card`: Card content skeleton (3 rows)
	 * - `list`: List item skeleton (2 rows, with avatar)
	 * - `compact`: Compact skeleton (2 rows)
	 * - `custom`: Custom configuration via props
	 */
	variant?: 'page' | 'card' | 'list' | 'compact' | 'custom';

	/**
	 * Number of skeleton items to render (for list variant)
	 * @default 1
	 */
	count?: number;

	/**
	 * Number of paragraph rows (for custom variant)
	 * @default 4
	 */
	rows?: number;

	/**
	 * Show avatar (for list variant)
	 * @default true
	 */
	avatar?: boolean;

	/**
	 * Show title skeleton
	 * @default true
	 */
	title?: boolean;

	/**
	 * Additional Ant Design Skeleton props
	 */
	skeletonProps?: SkeletonProps;

	/**
	 * Custom className
	 */
	className?: string;

	/**
	 * Custom style
	 */
	style?: React.CSSProperties;

	/**
	 * Wrap in Card component
	 * @default false
	 */
	wrapped?: boolean;

	/**
	 * Card props when wrapped is true
	 */
	cardProps?: {
		style?: React.CSSProperties;
		className?: string;
	};
}

/**
 * AppSkeleton Component
 *
 * A comprehensive, theme-aware skeleton component system that follows
 * the "Zen Mastery" design philosophy with smooth animations and
 * mobile-first responsive design.
 */
export default function AppSkeleton({
	variant = 'page',
	count = 1,
	rows = 4,
	avatar = true,
	title = true,
	skeletonProps,
	className,
	style,
	wrapped = false,
	cardProps,
}: AppSkeletonProps) {
	const { token } = useToken();

	// Variant configurations
	const variantConfigs = {
		page: {
			rows: 8,
			title: true,
			avatar: false,
		},
		card: {
			rows: 3,
			title: true,
			avatar: false,
		},
		list: {
			rows: 2,
			title: false,
			avatar: true,
		},
		compact: {
			rows: 2,
			title: false,
			avatar: false,
		},
		custom: {
			rows,
			title,
			avatar: false,
		},
	};

	const config = variantConfigs[variant];
	const finalRows = variant === 'custom' ? rows : config.rows;
	const finalTitle = variant === 'custom' ? title : config.title;
	const finalAvatar = variant === 'custom' ? false : variant === 'list' ? avatar : config.avatar;

	// Base skeleton style with theme tokens
	const baseSkeletonStyle: React.CSSProperties = {
		...style,
	};

	// Default skeleton props with theme-aware settings
	const defaultSkeletonProps: SkeletonProps = {
		active: true,
		paragraph: {
			rows: finalRows,
			width: variant === 'list' ? ['100%', '60%'] : undefined,
		},
		title: finalTitle ? { width: variant === 'list' ? '60%' : '40%' } : false,
		avatar: finalAvatar ? { size: 'default', shape: 'circle' as const } : false,
		...skeletonProps,
	};

	// Render single skeleton
	const renderSkeleton = () => (
		<Skeleton {...defaultSkeletonProps} style={baseSkeletonStyle} className={className} />
	);

	// Render list variant with multiple items
	if (variant === 'list' && count > 1) {
		const skeletons = Array.from({ length: count }, (_, index) => (
			<div key={index}>{renderSkeleton()}</div>
		));

		const content = (
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				{skeletons}
			</Space>
		);

		return wrapped ? (
			<Card
				style={{
					borderRadius: token.borderRadius,
					...cardProps?.style,
				}}
				className={cardProps?.className}
			>
				{content}
			</Card>
		) : (
			content
		);
	}

	// Render single skeleton
	const content = renderSkeleton();

	return wrapped ? (
		<Card
			style={{
				borderRadius: token.borderRadius,
				...cardProps?.style,
			}}
			className={cardProps?.className}
		>
			{content}
		</Card>
	) : (
		content
	);
}

/**
 * Pre-configured skeleton components for common use cases
 */

/**
 * PageSkeleton - Full page loading skeleton
 */
export function PageSkeleton(props?: Omit<AppSkeletonProps, 'variant'>) {
	return <AppSkeleton variant="page" {...props} />;
}

/**
 * CardSkeleton - Card content skeleton
 */
export function CardSkeleton(props?: Omit<AppSkeletonProps, 'variant'>) {
	return <AppSkeleton variant="card" {...props} />;
}

/**
 * ListSkeleton - List item skeleton with avatar
 */
export function ListSkeleton({ count = 1, ...props }: Omit<AppSkeletonProps, 'variant'>) {
	return <AppSkeleton variant="list" count={count} {...props} />;
}

/**
 * CompactSkeleton - Compact skeleton for small spaces
 */
export function CompactSkeleton(props?: Omit<AppSkeletonProps, 'variant'>) {
	return <AppSkeleton variant="compact" {...props} />;
}
