'use client';

import type { NavBarUser } from '@/modules/ui/components/navbar/types';
import LanguageSelector from '@/modules/user/components/LanguageSelector';
import ThemeToggle from '@/modules/user/components/ThemeToggle';
import {
	BugOutlined,
	FireFilled,
	FontSizeOutlined,
	HomeOutlined,
	LogoutOutlined,
	SettingOutlined,
	ShareAltOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Flex, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface MobileUserDrawerProps {
	open: boolean;
	onClose: () => void;
	user: NavBarUser;
	streak: number;
	isPublic: boolean;
	onSettings: () => void;
	onShare: () => void;
	onBugReport: () => void;
	onLogout: () => void;
}

/**
 * MobileUserDrawer Component
 * Mobile bottom drawer for user menu (public and authenticated states)
 */
export default function MobileUserDrawer({
	open,
	onClose,
	user,
	streak,
	isPublic,
	onSettings,
	onShare,
	onBugReport,
	onLogout,
}: MobileUserDrawerProps) {
	const { token } = useToken();
	const t = useTranslations('NavBar');
	const tCommon = useTranslations('Common');
	const tSettings = useTranslations('Settings');

	return (
		<Drawer
			placement="bottom"
			closable={false}
			onClose={onClose}
			open={open}
			size="default"
			title={isPublic ? t('signUpToAccess') : user?.user_metadata?.full_name || t('guest')}
			aria-label={isPublic ? 'Sign up drawer' : 'User menu drawer'}
			styles={{
				body: {
					padding: 'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 16px)',
					height: '100%',
					overflowY: 'auto',
				},
				mask: { backdropFilter: 'blur(4px)' },
			}}
			style={{
				background: token.colorBgContainer,
				borderTopLeftRadius: 24,
				borderTopRightRadius: 24,
			}}
		>
			{isPublic ? (
				/* Public User Drawer */
				<Flex
					vertical
					gap={'middle'}
					align="center"
					style={{ padding: 'clamp(20px, 5vw, 24px) 0' }}
				>
					<Avatar
						size={64}
						icon={<UserOutlined />}
						style={{
							backgroundColor: token.colorPrimary,
							border: `4px solid ${token.colorBgLayout}`,
						}}
					/>
					<div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 5vw, 24px)' }}>
						<Text
							strong
							style={{
								fontSize: 'clamp(18px, 4vw, 20px)',
								display: 'block',
								marginBottom: 8,
								color: token.colorText,
							}}
						>
							{t('signUpToAccess')}
						</Text>
						<Text
							type="secondary"
							style={{
								fontSize: 'clamp(12px, 3vw, 14px)',
								color: token.colorTextSecondary,
							}}
						>
							{t('signUpToAccessDesc')}
						</Text>
					</div>

					{/* Language & Theme Controls for Public Users */}
					<Flex
						vertical
						gap="small"
						style={{
							width: '100%',
							padding: '0 clamp(20px, 5vw, 24px)',
							marginBottom: 16,
						}}
					>
						<Flex
							justify="space-between"
							align="center"
							style={{
								padding: '12px 16px',
								background: token.colorFillQuaternary,
								borderRadius: 12,
								border: `1px solid ${token.colorBorderSecondary}`,
							}}
						>
							<Text style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
								{tCommon('language') || 'Language'}
							</Text>
							<LanguageSelector />
						</Flex>
						<Flex
							justify="space-between"
							align="center"
							style={{
								padding: '12px 16px',
								background: token.colorFillQuaternary,
								borderRadius: 12,
								border: `1px solid ${token.colorBorderSecondary}`,
							}}
						>
							<Text style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>{tSettings('theme')}</Text>
							<ThemeToggle />
						</Flex>
					</Flex>

					<Link
						href="/reference/kana"
						prefetch={true}
						onClick={onClose}
						style={{ textDecoration: 'none', marginBottom: 12, display: 'block' }}
					>
						<Button
							type="default"
							size="large"
							block
							icon={<FontSizeOutlined />}
							style={{
								height: 'clamp(44px, 10vw, 48px)',
								fontSize: 'clamp(14px, 3.5vw, 16px)',
								justifyContent: 'flex-start',
								paddingLeft: 'clamp(20px, 5vw, 24px)',
								color: token.colorText,
							}}
						>
							{t('kanaReference')}
						</Button>
					</Link>
					<Link href="/login" prefetch={true} onClick={onClose}>
						<Button
							type="primary"
							size="large"
							block
							style={{
								marginBottom: 12,
								height: 'clamp(44px, 10vw, 48px)',
								fontSize: 'clamp(14px, 3.5vw, 16px)',
							}}
						>
							{t('loginStart')}
						</Button>
					</Link>
					<Button
						type="text"
						size="large"
						icon={<BugOutlined />}
						block
						onClick={() => {
							onClose();
							onBugReport();
						}}
						style={{
							height: 'clamp(44px, 10vw, 48px)',
							fontSize: 'clamp(14px, 3.5vw, 16px)',
							color: token.colorText,
						}}
					>
						{tCommon('reportIssue')}
					</Button>
				</Flex>
			) : (
				/* Authenticated User Drawer */
				<Flex vertical gap={'middle'}>
					{/* 1. Header: Identity */}
					<Flex vertical align="center" gap="small">
						<Avatar
							size={64}
							src={user?.user_metadata?.avatar_url}
							icon={<UserOutlined />}
							style={{ border: `4px solid ${token.colorBgLayout}` }}
						/>
						<div style={{ textAlign: 'center' }}>
							<Text strong style={{ fontSize: 18, display: 'block' }}>
								{user?.user_metadata?.full_name || t('guest')}
							</Text>
							<Text type="secondary" style={{ fontSize: 14 }}>
								{user?.email}
							</Text>
						</div>
						{/* Streak Display */}
						<Flex align="center" gap={4} style={{ marginTop: 8 }}>
							<FireFilled style={{ color: token.colorWarning, fontSize: 18 }} />
							<Text strong style={{ fontSize: 16 }}>
								{streak}
							</Text>
						</Flex>
					</Flex>

					<div style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }} />

					{/* 2. Actions: Utility */}
					<Flex vertical gap="small">
						<Button
							block
							size="large"
							icon={<SettingOutlined />}
							style={{
								justifyContent: 'flex-start',
								paddingLeft: 'clamp(20px, 5vw, 24px)',
								fontSize: 'clamp(14px, 3.5vw, 16px)',
								height: 'clamp(44px, 10vw, 48px)',
								color: token.colorText,
							}}
							onClick={() => {
								onClose();
								onSettings();
							}}
						>
							{t('settings')}
						</Button>
						<Button
							block
							size="large"
							icon={<ShareAltOutlined />}
							style={{
								justifyContent: 'flex-start',
								paddingLeft: 'clamp(20px, 5vw, 24px)',
								fontSize: 'clamp(14px, 3.5vw, 16px)',
								height: 'clamp(44px, 10vw, 48px)',
								color: token.colorText,
							}}
							onClick={() => {
								onClose();
								onShare();
							}}
						>
							{t('share')}
						</Button>
						<Link href="/reference/kana" onClick={onClose} style={{ textDecoration: 'none' }}>
							<Button
								block
								size="large"
								icon={<FontSizeOutlined />}
								style={{
									justifyContent: 'flex-start',
									paddingLeft: 'clamp(20px, 5vw, 24px)',
									fontSize: 'clamp(14px, 3.5vw, 16px)',
									height: 'clamp(44px, 10vw, 48px)',
									color: token.colorText,
								}}
							>
								{t('kanaReference')}
							</Button>
						</Link>
						<Link href="/" onClick={onClose} style={{ textDecoration: 'none' }}>
							<Button
								block
								size="large"
								icon={<HomeOutlined />}
								style={{
									justifyContent: 'flex-start',
									paddingLeft: 'clamp(20px, 5vw, 24px)',
									fontSize: 'clamp(14px, 3.5vw, 16px)',
									height: 'clamp(44px, 10vw, 48px)',
									color: token.colorText,
								}}
							>
								{t('viewLanding')}
							</Button>
						</Link>
						<Button
							block
							size="large"
							icon={<BugOutlined />}
							style={{
								justifyContent: 'flex-start',
								paddingLeft: 'clamp(20px, 5vw, 24px)',
								fontSize: 'clamp(14px, 3.5vw, 16px)',
								height: 'clamp(44px, 10vw, 48px)',
								color: token.colorText,
							}}
							onClick={() => {
								onClose();
								onBugReport();
							}}
						>
							{tCommon('reportIssue')}
						</Button>
					</Flex>

					{/* 3. Exit: Logout */}
					<Flex
						style={{
							justifyContent: 'flex-end',
							boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
							padding: 8,
						}}
					>
						<Button danger icon={<LogoutOutlined />} onClick={onLogout} />
					</Flex>
				</Flex>
			)}
		</Drawer>
	);
}
