'use client';

import { Flex } from 'antd';
import { startTransition, useLayoutEffect, useState } from 'react';

import AppSkeleton from './AppSkeleton';

/**
 * LayoutSkeleton - Root layout loading skeleton
 *
 * Specialized skeleton component for the root layout Suspense boundary.
 * Used as a fallback when app providers (NextIntlClientProvider, AntdRegistry, ThemeProvider)
 * are loading during Partial Prerendering (PPR).
 *
 * Features:
 * - SSR optimization: Renders plain HTML during SSR to prevent CLS (Cumulative Layout Shift)
 * - Theme-aware: Uses AppSkeleton after mount when theme context is available
 * - Matches AppSkeleton dimensions exactly for seamless transition
 * - Wraps content in <main className="app-main"> for proper layout structure
 *
 * Architecture:
 * - Located in src/modules/ui/components/skeletons/ (UI module)
 * - Follows Vertical Slice Architecture (UI domain)
 * - Uses AppSkeleton internally for consistency
 */
export default function LayoutSkeleton() {
	const [mounted, setMounted] = useState(false);

	useLayoutEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	// During SSR/prerender, render plain HTML with EXACT same dimensions as AppSkeleton
	// This prevents layout shift (CLS) when transitioning from SSR to client
	// Uses CSS variables for theme-agnostic rendering
	if (!mounted) {
		return (
			<main className="app-main">
				<div
					style={{
						minHeight: '60vh',
						padding: 'var(--spacing-lg)', // 24px
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{/* Match AppSkeleton compact variant dimensions: 4 rows, ~16px line height, ~16px gap */}
					<div
						style={{
							width: '100%',
							maxWidth: 400,
							display: 'flex',
							flexDirection: 'column',
							gap: 'var(--spacing-md)', // 16px
						}}
					>
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								style={{
									width: i === 1 ? '100%' : i === 4 ? '60%' : '100%',
									height: 16,
									// Neutral color for SSR - works in both themes
									// Ant Design Skeleton: rgba(0,0,0,0.06) light, rgba(255,255,255,0.08) dark
									background: 'rgba(0, 0, 0, 0.06)',
									borderRadius: 4,
									animation: 'pulse 1.5s ease-in-out infinite',
								}}
								className="layout-skeleton-ssr-bar"
							/>
						))}
					</div>
				</div>
			</main>
		);
	}

	// On client, render AppSkeleton (theme-aware, uses Ant Design tokens)
	// Note: Theme context may not be available yet, but AppSkeleton handles this gracefully
	return (
		<main className="app-main">
			<Flex
				vertical
				align="center"
				justify="center"
				style={{
					minHeight: '60vh',
					padding: 'var(--spacing-lg)', // 24px
					width: '100%',
				}}
			>
				<AppSkeleton variant="compact" rows={4} title={false} />
			</Flex>
		</main>
	);
}
