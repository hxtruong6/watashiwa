'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { BellFilled, BellOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip, theme } from 'antd';
import { useTranslations } from 'next-intl';

export default function NotificationManager() {
	const { permission, isSubscribed, subscribe, loading } = usePushNotifications();
	const { token } = theme.useToken();
	// We can use translations here if we had them, defaulting to English for now
	// const t = useTranslations('Notifications');

	if (permission === 'denied') {
		return (
			<Tooltip title="Notifications blocked. Enable in browser settings.">
				<Button
					type="text"
					icon={<BellOutlined style={{ color: token.colorTextDisabled }} />}
					disabled
				/>
			</Tooltip>
		);
	}

	if (isSubscribed) {
		return (
			<Tooltip title="Notifications Active">
				<Button type="text" icon={<BellFilled style={{ color: token.colorWarning }} />} />
			</Tooltip>
		);
	}

	return (
		<Tooltip title="Enable Reminders">
			<Button type="text" loading={loading} icon={<BellOutlined />} onClick={subscribe} />
		</Tooltip>
	);
}
