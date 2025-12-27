'use client';

import { GoogleOutlined, MailOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Flex, Space, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';

import { useLoginMethodCache } from '../hooks/useLoginMethodCache';

const { Text } = Typography;
const { useToken } = theme;

interface LoginMethodSelectorProps {
	onEmailClick: (email: string) => void;
	onGoogleClick: () => void;
}

/**
 * Component to display cached login methods with "last login" badges
 * Helps users quickly select their preferred login method
 */
export function LoginMethodSelector({ onEmailClick, onGoogleClick }: LoginMethodSelectorProps) {
	const { token } = useToken();
	const t = useTranslations('Login');
	const { getCachedMethods } = useLoginMethodCache();

	const cachedMethods = getCachedMethods();

	if (cachedMethods.length === 0) {
		return null;
	}

	const getBadgeColor = (badge?: string) => {
		// Use theme tokens that adapt to dark/light mode
		switch (badge) {
			case 'today':
				return token.colorSuccess; // Green - works in both themes
			case 'week':
				return token.colorInfo; // Blue - works in both themes
			case 'month':
				return token.colorWarning; // Yellow/Orange - works in both themes
			case 'recent':
				return token.colorTextSecondary; // Adapts to theme
			default:
				return token.colorTextTertiary; // Adapts to theme
		}
	};

	const getBadgeText = (badge?: string) => {
		switch (badge) {
			case 'today':
				return t('lastLoginToday') || 'Today';
			case 'week':
				return t('lastLoginWeek') || 'This week';
			case 'month':
				return t('lastLoginMonth') || 'This month';
			case 'recent':
				return t('lastLoginRecent') || 'Recent';
			default:
				return t('lastLoginOld') || 'Long ago';
		}
	};

	const formatEmail = (email: string) => {
		// Show first 3 chars and domain for privacy
		const [local, domain] = email.split('@');
		if (local.length <= 3) return email;
		const masked = `${local.substring(0, 3)}***@${domain}`;
		// Ensure it doesn't exceed reasonable length for mobile
		return masked.length > 30 ? `${masked.substring(0, 27)}...` : masked;
	};

	return (
		<Card
			style={{
				marginBottom: 24,
				background: token.colorBgContainer,
				borderColor: token.colorBorder,
			}}
			styles={{ body: { padding: 16 } }}
		>
			<Text type="secondary" style={{ fontSize: 12, marginBottom: 12, display: 'block' }}>
				{t('quickLogin') || 'Quick login'}
			</Text>
			<Space direction="vertical" style={{ width: '100%' }} size="small">
				{cachedMethods.map((method) => {
					const primaryProvider = method.providers[0]; // Most recent
					const badge = primaryProvider.badge;

					return (
						<Button
							key={method.email}
							type="default"
							block
							size="large"
							icon={primaryProvider.provider === 'google' ? <GoogleOutlined /> : <MailOutlined />}
							onClick={() => {
								if (primaryProvider.provider === 'google') {
									onGoogleClick();
								} else {
									onEmailClick(method.email);
								}
							}}
							style={{
								height: 48,
								borderRadius: 12,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								paddingLeft: 16,
								paddingRight: 16,
								minHeight: 44, // Ensure touch target meets 44x44px minimum
							}}
						>
							<Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
								<Text
									strong
									style={{
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										flex: 1,
									}}
								>
									{formatEmail(method.email)}
								</Text>
								{primaryProvider.provider === 'google' && (
									<Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
										{t('providerGoogle') || 'Google'}
									</Text>
								)}
							</Flex>
							{badge && (
								<Badge
									color={getBadgeColor(badge)}
									text={getBadgeText(badge)}
									style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}
								/>
							)}
						</Button>
					);
				})}
			</Space>
		</Card>
	);
}
