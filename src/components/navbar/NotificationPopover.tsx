'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { BellFilled, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, Popover, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

export default function NotificationPopover() {
	const { token } = useToken();
	const { isSubscribed, subscribe, permission, loading } = usePushNotifications();
	const t = useTranslations('Notifications');

	const [open, setOpen] = useState(false);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
	};

	const content = (
		<div style={{ width: 280 }}>
			<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<Text strong>{t('title')}</Text>
				<Link href="/?settings=true" onClick={() => setOpen(false)}>
					<SettingOutlined style={{ color: token.colorTextSecondary }} />
				</Link>
			</Flex>

			{permission === 'denied' && (
				<Flex
					vertical
					gap="small"
					align="center"
					style={{ padding: '16px 0', textAlign: 'center' }}
				>
					<Text type="secondary">{t('blocked')}</Text>
					<Text style={{ fontSize: 12 }}>{t('blockedDesc')}</Text>
				</Flex>
			)}

			{permission !== 'denied' && !isSubscribed && (
				<Flex vertical gap="small" align="center" style={{ padding: '8px 0', textAlign: 'center' }}>
					<div style={{ fontSize: 32 }}>🔕</div>
					<Text strong>{t('promptTitle')}</Text>
					<Text type="secondary" style={{ fontSize: 12 }}>
						{t('promptBody')}
					</Text>
					<Button
						type="primary"
						onClick={subscribe}
						loading={loading}
						style={{ marginTop: 8 }}
						block
					>
						{t('enable')}
					</Button>
				</Flex>
			)}

			{isSubscribed && (
				<Flex
					vertical
					gap="middle"
					align="center"
					style={{ padding: '16px 0', textAlign: 'center' }}
				>
					<div style={{ fontSize: 32 }}>🎉</div>
					<Text strong>{t('successTitle')}</Text>
					<Text type="secondary" style={{ fontSize: 12 }}>
						{t('successBody')}
					</Text>
					{/* Placeholder for future "History" list */}
					<div
						style={{
							marginTop: 16,
							paddingTop: 16,
							borderTop: `1px solid ${token.colorBorderSecondary}`,
							width: '100%',
						}}
					>
						<Text type="secondary" style={{ fontSize: 11 }}>
							{t('empty')}
						</Text>
					</div>
				</Flex>
			)}
		</div>
	);

	return (
		<Popover
			content={content}
			trigger="click"
			open={open}
			onOpenChange={handleOpenChange}
			placement="bottomRight"
			arrow={false}
		>
			<div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
				<Badge dot={!isSubscribed && permission !== 'denied'} color="blue" offset={[-4, 4]}>
					<Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
				</Badge>
			</div>
		</Popover>
	);
}
