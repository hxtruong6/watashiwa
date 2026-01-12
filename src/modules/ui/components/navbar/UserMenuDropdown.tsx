'use client';

import type { NavBarUser } from '@/modules/ui/components/navbar/types';
import {
	BugOutlined,
	HomeOutlined,
	LogoutOutlined,
	SettingOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Flex, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface UserMenuDropdownProps {
	user: NavBarUser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSettings: () => void;
	onShare: () => void;
	onBugReport: () => void;
	onLogout: () => void;
}

/**
 * UserMenuDropdown Component
 * Desktop user menu dropdown with user info and actions
 * Handles React 19 compatibility for popup positioning
 */
export default function UserMenuDropdown({
	user,
	open,
	onOpenChange,
	onSettings,
	onShare,
	onBugReport,
	onLogout,
}: UserMenuDropdownProps) {
	const { token } = useToken();
	const t = useTranslations('NavBar');
	const tCommon = useTranslations('Common');

	const userMenuProps: MenuProps = {
		items: [
			{
				key: 'email',
				label: (
					<Flex vertical gap={2} style={{ padding: '4px 0' }}>
						<Text strong style={{ fontSize: 13 }}>
							{t('greeting', { name: user?.user_metadata?.full_name || t('guest') })}
						</Text>
						<Text type="secondary" style={{ fontSize: 11 }}>
							{user?.email}
						</Text>
					</Flex>
				),
				disabled: true,
				style: { cursor: 'default', opacity: 1 },
			},
			{ type: 'divider' },
			{
				key: 'settings',
				icon: <SettingOutlined />,
				label: t('settings'),
				onClick: () => {
					onOpenChange(false);
					onSettings();
				},
			},
			{
				key: 'share',
				icon: <ShareAltOutlined />,
				label: t('share'),
				onClick: () => {
					onOpenChange(false);
					onShare();
				},
			},
			{ type: 'divider' },
			{
				key: 'landing',
				icon: <HomeOutlined />,
				label: (
					<Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
						{t('viewLanding')}
					</Link>
				),
				onClick: () => {
					onOpenChange(false);
				},
			},
			{
				key: 'report_bug',
				icon: <BugOutlined />,
				label: tCommon('reportIssue'),
				onClick: () => {
					onOpenChange(false);
					onBugReport();
				},
			},
			{
				key: 'logout',
				icon: <LogoutOutlined />,
				label: tCommon('logout'),
				onClick: () => {
					onOpenChange(false);
					onLogout();
				},
				danger: true,
			},
		],
	};

	return (
		<Dropdown
			menu={userMenuProps}
			trigger={['click']}
			placement="bottomRight"
			open={open}
			onOpenChange={onOpenChange}
			getPopupContainer={() => {
				// React 19 compatibility: render popup in body to avoid positioning issues
				return document.body;
			}}
			// React 19 workaround: ensure popup renders correctly
			destroyOnHidden={true}
		>
			<Avatar
				src={user?.user_metadata?.avatar_url}
				style={{
					backgroundColor: token.colorPrimary,
					cursor: 'pointer',
					border: `2px solid ${token.colorBgContainer}`,
				}}
				icon={<UserOutlined />}
			/>
		</Dropdown>
	);
}
