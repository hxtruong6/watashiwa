'use client';

import { usePWA } from '@/hooks/usePWA';
import {
	CloseOutlined,
	DownloadOutlined,
	PlusSquareOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import { Drawer, FloatButton, Steps, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

const PWAInstallPrompt = () => {
	const t = useTranslations('PWA');
	const { isInstallable, isIOS, isStandalone, install } = usePWA();
	const [showIosGuide, setShowIosGuide] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Logic to show/hide prompt based on localStorage dismissal
		if (isStandalone) {
			// eslint-disable-next-line
			setIsVisible(false);
			return;
		}

		const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
		const now = Date.now();
		// Show again after 3 days if dismissed
		if (dismissedAt && now - parseInt(dismissedAt) < 3 * 24 * 60 * 60 * 1000) {
			setIsVisible(false);
			return;
		}

		// On iOS, we always show it initially (or maybe wait a bit) if not standalone
		// On Android, we rely on isInstallable event
		if (isIOS) {
			setIsVisible(true);
		} else if (isInstallable) {
			setIsVisible(true);
		}
	}, [isIOS, isInstallable, isStandalone]);

	const handleDismiss = () => {
		setIsVisible(false);
		localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
	};

	const handleClick = () => {
		if (isIOS) {
			setShowIosGuide(true);
		} else {
			install();
		}
	};

	if (!isVisible) return null;

	// Mobile floating button style
	return (
		<>
			<FloatButton.Group shape="square" style={{ bottom: 24, right: 24 }}>
				<FloatButton icon={<CloseOutlined />} onClick={handleDismiss} tooltip={t('dismiss')} />
				<FloatButton
					icon={<DownloadOutlined />}
					type="primary"
					onClick={handleClick}
					tooltip={t('installButton')}
					badge={{ dot: true, color: 'green' }}
				/>
			</FloatButton.Group>

			{/* iOS Guide Drawer */}
			<Drawer
				title={t('iosGuideTitle')}
				placement="bottom"
				onClose={() => setShowIosGuide(false)}
				open={showIosGuide}
				size="default"
			>
				<Steps
					orientation="vertical"
					items={[
						{
							title: (
								<Text>
									{t.rich('iosGuideStep1', {
										strong: (chunks) => <strong>{chunks}</strong>,
									})}
								</Text>
							),
							icon: <ShareAltOutlined />,
							description: (
								<div style={{ marginTop: 8 }}>
									<ShareAltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
								</div>
							),
						},
						{
							title: (
								<Text>
									{t.rich('iosGuideStep2', {
										strong: (chunks) => <strong>{chunks}</strong>,
									})}
								</Text>
							),
							icon: <PlusSquareOutlined />,
							description: (
								<div style={{ marginTop: 8 }}>
									<PlusSquareOutlined style={{ fontSize: 24 }} />
								</div>
							),
						},
						{
							title: (
								<Text>
									{t.rich('iosGuideStep3', {
										strong: (chunks) => <strong>{chunks}</strong>,
									})}
								</Text>
							),
							status: 'finish',
							icon: <span style={{ fontSize: 16, fontWeight: 'bold' }}>Add</span>,
						},
					]}
				/>
			</Drawer>
		</>
	);
};

export default PWAInstallPrompt;
