'use client';

import { isProtectedRoute } from '@/modules/ui/components/navbar/NavConfig';
import Link from 'next/link';
import React from 'react';

interface ProtectedLinkProps {
	href: string;
	children: React.ReactNode;
	isPublic?: boolean;
	prefetch?: boolean;
	className?: string;
	style?: React.CSSProperties;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * ProtectedLink component that handles auth redirects while enabling prefetching
 * For protected routes accessed by public users, it redirects to login with returnUrl
 * but still allows prefetching of the target route
 */
export default function ProtectedLink({
	href,
	children,
	isPublic = false,
	prefetch = true,
	className,
	style,
	onClick,
}: ProtectedLinkProps) {
	// If route is protected and user is public, redirect to login with returnUrl
	const finalHref =
		isPublic && isProtectedRoute(href) ? `/login?returnUrl=${encodeURIComponent(href)}` : href;

	return (
		<Link
			href={finalHref}
			prefetch={prefetch}
			className={className}
			style={style}
			onClick={onClick}
		>
			{children}
		</Link>
	);
}
