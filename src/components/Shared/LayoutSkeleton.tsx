'use client';

import { Flex, Skeleton } from 'antd';
import { startTransition, useLayoutEffect, useState } from 'react';

export default function LayoutSkeleton() {
	const [mounted, setMounted] = useState(false);

	useLayoutEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	// During SSR/prerender, render plain HTML with EXACT same dimensions as Ant Design Skeleton
	// This prevents layout shift (CLS) when transitioning from SSR to client
	if (!mounted) {
		return (
			<main className="app-main">
				<div
					style={{
						minHeight: '60vh',
						padding: 24,
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{/* Match Ant Design Skeleton dimensions: 4 rows, ~16px line height, ~8px gap */}
					<div
						style={{
							width: '100%',
							maxWidth: 400,
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
						}}
					>
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								style={{
									width: i === 1 ? '100%' : i === 4 ? '60%' : '100%',
									height: 16,
									background: 'rgba(0,0,0,0.06)',
									borderRadius: 4,
									animation: 'pulse 1.5s ease-in-out infinite',
								}}
							/>
						))}
					</div>
				</div>
			</main>
		);
	}

	// On client, render Ant Design components
	return (
		<main className="app-main">
			<Flex
				vertical
				align="center"
				justify="center"
				style={{
					minHeight: '60vh',
					padding: 24,
					width: '100%',
				}}
			>
				<Skeleton active paragraph={{ rows: 4 }} />
			</Flex>
		</main>
	);
}
