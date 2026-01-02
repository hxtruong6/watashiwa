'use client';

import { useSetupStatus } from '@/hooks/useSetupStatus';
import { isProtectedRoute } from '@/modules/ui/components/navbar/NavConfig';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
 * ProtectedLink component that handles auth redirects and setup checks while enabling prefetching
 * For protected routes accessed by public users, it redirects to login with returnUrl
 * For protected routes accessed by authenticated users without setup, it redirects to setup
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
	const router = useRouter();
	const { setupCompleted } = useSetupStatus();

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		// Call custom onClick if provided
		if (onClick) {
			onClick(e);
		}

		// If route is protected and user is authenticated but hasn't completed setup
		if (!isPublic && isProtectedRoute(href) && setupCompleted === false) {
			e.preventDefault();
			const returnUrl = encodeURIComponent(href);
			router.push(`/profile/setup?returnUrl=${returnUrl}`);
			return;
		}
	};

	// If route is protected and user is public, redirect to login with returnUrl
	const finalHref =
		isPublic && isProtectedRoute(href) ? `/login?returnUrl=${encodeURIComponent(href)}` : href;

	return (
		<Link
			href={finalHref}
			prefetch={prefetch}
			className={className}
			style={style}
			onClick={handleClick}
		>
			{children}
		</Link>
	);
}
