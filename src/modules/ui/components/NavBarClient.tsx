'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import ShareModal from '@/modules/deck/components/ShareModal';
import DesktopNavDock from '@/modules/ui/components/navbar/DesktopNavDock';
import MobileNavBar from '@/modules/ui/components/navbar/MobileNavBar';
import MobileUserDrawer from '@/modules/ui/components/navbar/MobileUserDrawer';
import SettingsModal from '@/modules/ui/components/navbar/SettingsModal';
import type { NavBarClientProps } from '@/modules/ui/components/navbar/types';
import {
	NAVBAR_SPACER_DESKTOP,
	NAVBAR_SPACER_MOBILE,
} from '@/modules/ui/components/navbar/useNavBarConstants';
import { useNavBarVisibility } from '@/modules/ui/components/navbar/useNavBarVisibility';
import { useResponsiveBreakpoint } from '@/modules/ui/components/navbar/useResponsiveBreakpoint';
import * as Sentry from '@sentry/nextjs';
import { theme } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { useToken } = theme;

/**
 * NavBar Client Component
 * Orchestrates navbar visibility, state, and composed components
 * Receives user data and streak from server component
 */
export default function NavBarClient({ user, streak = 0 }: NavBarClientProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { token } = useToken();
	const { logout } = useAuth({
		onError: (errorMsg) => {
			console.error('[NavBar] Logout error:', errorMsg);
		},
	});

	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);

	// Use responsive breakpoint hook with proper SSR handling
	const isXs = useResponsiveBreakpoint();

	// Use visibility hook for consolidated logic
	const { shouldShow } = useNavBarVisibility();

	// Check URL for settings trigger
	useEffect(() => {
		if (searchParams.get('settings') === 'true') {
			setTimeout(() => setSettingsModalOpen(true), 0);
			const params = new URLSearchParams(searchParams.toString());
			params.delete('settings');
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		}
	}, [searchParams, pathname, router]);

	const handleBugReport = async () => {
		const feedback = Sentry.getFeedback();
		if (feedback) {
			const form = await feedback.createForm();
			form.appendToDom();
			form.open();
		}
	};

	const handleLogout = async () => {
		await logout();
	};

	// Determine if user is public (not authenticated)
	const isPublic = !user;

	// Early return if navbar should be hidden (handled by visibility hook)
	if (!shouldShow) {
		return null;
	}

	return (
		<>
			{/* Spacer to prevent overlap content */}
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

			{/* Desktop Navigation */}
			{!isXs && (
				<DesktopNavDock
					user={user ?? null}
					streak={streak}
					isPublic={isPublic}
					pathname={pathname}
					userMenuOpen={userMenuOpen}
					onUserMenuOpenChange={setUserMenuOpen}
					onSettings={() => setSettingsModalOpen(true)}
					onShare={() => setShareModalOpen(true)}
					onBugReport={handleBugReport}
					onLogout={handleLogout}
				/>
			)}

			{/* Mobile Navigation */}
			{isXs && (
				<MobileNavBar
					user={user ?? null}
					streak={streak}
					isPublic={isPublic}
					pathname={pathname}
					onDrawerOpen={() => setMobileDrawerOpen(true)}
				/>
			)}

			{/* Modals */}
			<ShareModal open={shareModalOpen} onCancel={() => setShareModalOpen(false)} />
			<SettingsModal
				open={settingsModalOpen}
				onCancel={() => setSettingsModalOpen(false)}
				user={user ?? null}
			/>

			{/* Mobile User Drawer */}
			<MobileUserDrawer
				open={mobileDrawerOpen}
				onClose={() => setMobileDrawerOpen(false)}
				user={user ?? null}
				streak={streak}
				isPublic={isPublic}
				onSettings={() => setSettingsModalOpen(true)}
				onShare={() => setShareModalOpen(true)}
				onBugReport={handleBugReport}
				onLogout={handleLogout}
			/>
		</>
	);
}
