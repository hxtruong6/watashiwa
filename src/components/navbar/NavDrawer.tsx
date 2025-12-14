'use client';

import React from 'react';
import { Drawer, Flex, Avatar, Typography, Button, Menu, Space, theme, Image } from 'antd';
import {
	UserOutlined,
	ShareAltOutlined,
	BugOutlined,
	LogoutOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import ThemeToggle from '../ThemeToggle';
import LanguageSelector from '../LanguageSelector';
import type { MenuProps } from 'antd';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { useToken } = theme;

interface User {
	id: string;
	email?: string;
	user_metadata?: {
		full_name?: string;
		avatar_url?: string;
	};
}

interface NavDrawerProps {
	open: boolean;
	onClose: () => void;
	user?: User | null;
	pathname: string;
	menuItems: MenuProps['items'];
	onShare: () => void;
	onBugReport: () => void;
	onLogout: () => void;
}

export default function NavDrawer({
	open,
	onClose,
	user,
	pathname,
	menuItems,
	onShare,
	onBugReport,
	onLogout,
}: NavDrawerProps) {
	const { token } = useToken();
	const t = useTranslations('NavBar');
	const tCommon = useTranslations('Common');

	return (
		<Drawer
			title={
				<Flex align="center" gap="small">
					<Image src="/assets/w_logo.png" alt="Logo" width={24} height={24} />
					<Text strong style={{ margin: 0, color: token.colorPrimary, whiteSpace: 'nowrap' }}>
						WatashiWa
					</Text>
				</Flex>
			}
			extra={
				<Space>
					<LanguageSelector />
				</Space>
			}
			placement="right"
			onClose={onClose}
			closable={false}
			open={open}
			styles={{ body: { padding: 0 }, wrapper: { width: 280 } }}
		>
			<Flex vertical style={{ height: '100%' }}>
				{user && (
					<div
						style={{
							padding: '20px 24px',
							borderBottom: `1px solid ${token.colorBorderSecondary}`,
							background: token.colorFillQuaternary,
						}}
					>
						<Flex gap={12} align="center">
							<Avatar
								size="large"
								icon={<UserOutlined />}
								src={user?.user_metadata?.avatar_url}
								style={{ backgroundColor: token.colorPrimary }}
							>
								{user?.email?.[0]?.toUpperCase()}
							</Avatar>
							<Flex vertical>
								<Text strong>{user?.user_metadata?.full_name || 'User'}</Text>
								<Text type="secondary" style={{ fontSize: 12 }}>
									{user?.email}
								</Text>
							</Flex>
						</Flex>
					</div>
				)}

				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					items={menuItems}
					style={{ borderRight: 'none', flex: 1 }}
					onClick={onClose}
				/>

				{user && (
					<div style={{ padding: '24px' }}>
						{/* Settings / Config Section */}
						{/* Config Box */}
						<div
							style={{
								marginBottom: 16,
								padding: '12px 16px',
								background: token.colorFillQuaternary,
								borderRadius: 12,
								border: `1px solid ${token.colorBorderSecondary}`,
							}}
						>
							<Flex justify="space-between" align="center">
								<ThemeToggle />
								<Flex gap="small" align="center">
									<SettingOutlined style={{ color: token.colorTextSecondary }} />
									<div
										style={{
											fontSize: 10,
											background: token.colorFillContent,
											color: token.colorTextDescription,
											padding: '2px 6px',
											borderRadius: 4,
										}}
									>
										Soon
									</div>
								</Flex>
							</Flex>
						</div>

						<Button
							block
							type="primary"
							icon={<ShareAltOutlined />}
							onClick={() => {
								onShare();
								onClose();
							}}
							style={{ marginBottom: 12, background: token.colorPrimary }}
						>
							{t('share')}
						</Button>
						<Button
							block
							type="text"
							icon={<BugOutlined />}
							onClick={onBugReport}
							style={{ marginBottom: 12 }}
						>
							{tCommon('reportIssue')}
						</Button>
						<Button block danger icon={<LogoutOutlined />} onClick={onLogout}>
							{tCommon('logout')}
						</Button>
					</div>
				)}
			</Flex>
		</Drawer>
	);
}
