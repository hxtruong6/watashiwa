'use client';

import { BankOutlined, CheckOutlined, CopyOutlined, HeartFilled } from '@ant-design/icons';
import { Card, ConfigProvider, Flex, Image, Tabs, Tooltip, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

const { Text, Paragraph, Title } = Typography;

function CopyToClipboard({
	text,
	copiedTooltip,
	copyTooltip,
}: {
	text: string;
	copiedTooltip: string;
	copyTooltip: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Flex
			align="center"
			gap="small"
			style={{
				background: '#fff',
				padding: '8px 16px',
				borderRadius: 8,
				border: '1px solid #e0e0e0',
				cursor: 'pointer',
				transition: 'all 0.2s',
			}}
			onClick={handleCopy}
		>
			<Text strong style={{ fontSize: 18, letterSpacing: 1 }}>
				{text}
			</Text>
			{copied ? (
				<Tooltip title={copiedTooltip}>
					<CheckOutlined style={{ color: '#52c41a' }} />
				</Tooltip>
			) : (
				<Tooltip title={copyTooltip}>
					<CopyOutlined style={{ color: '#999' }} />
				</Tooltip>
			)}
		</Flex>
	);
}

/**
 * Donation Section for Settings Drawer
 * Simple, calm, no floating/pulsing
 */
export default function DonationSection() {
	const t = useTranslations('Donation');

	const items = [
		{
			key: '1',
			label: 'VietQR',
			children: (
				<Flex vertical align="center" gap="middle" style={{ padding: '20px 0' }}>
					<Image
						src="/assets/qr_code/viet_qr.jpg"
						alt="VietQR Code"
						width={220}
						style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
					/>

					{/* Bank Info Section */}
					<div
						style={{
							background: '#f9f9f9',
							padding: '12px 16px',
							borderRadius: 8,
							width: '100%',
							maxWidth: 280,
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
						}}
					>
						<Flex align="center" gap={8} style={{ marginBottom: 4 }}>
							<BankOutlined style={{ color: '#1890ff' }} />
							<Text strong>{t('mbBank')}</Text>
						</Flex>
						<Flex justify="space-between" align="center">
							<Text copyable={{ text: '2282859598', tooltips: [t('copyAccount'), t('copied')] }}>
								2282859598
							</Text>
						</Flex>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Hoang Xuan Truong
						</Text>
					</div>

					<Text type="secondary" style={{ textAlign: 'center', maxWidth: 300 }}>
						{t('scanVietQR')}
					</Text>
				</Flex>
			),
		},
		{
			key: '2',
			label: 'Momo',
			children: (
				<Flex vertical align="center" gap="middle" style={{ padding: '20px 0' }}>
					<Image
						src="/assets/qr_code/momo_qr.jpg"
						alt="Momo QR Code"
						width={250}
						style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
					/>
					<Text type="secondary" style={{ textAlign: 'center', maxWidth: 300 }}>
						{t('scanMomo')}
					</Text>
				</Flex>
			),
		},
		{
			key: '3',
			label: 'PayPay (Japan)',
			children: (
				<Flex vertical align="center" gap="middle" style={{ padding: '40px 0' }}>
					<div
						style={{
							background: '#f5f5f5',
							padding: '30px',
							borderRadius: 16,
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 16,
						}}
					>
						<Title level={4} style={{ margin: 0, color: '#FF0033' }}>
							{t('payPayId')}
						</Title>
						<CopyToClipboard text="hxtruong6" copiedTooltip={t('copied')} copyTooltip="Copy" />
						<Text type="secondary">{t('payPayInstructions')}</Text>
					</div>
				</Flex>
			),
		},
	];

	return (
		<Card
			size="small"
			style={{
				marginTop: 24,
				borderRadius: 12,
				boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
			}}
		>
			<Flex vertical align="center" style={{ paddingTop: 20 }}>
				<div
					style={{
						background: '#fff1f0',
						width: 60,
						height: 60,
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 16,
					}}
				>
					<HeartFilled style={{ fontSize: 30, color: '#ff4d4f' }} />
				</div>
				<Title level={3} style={{ margin: '0 0 8px 0' }}>
					{t('title')}
				</Title>
				<Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
					{t('description')}
				</Paragraph>

				<div style={{ width: '100%' }}>
					<Tabs
						defaultActiveKey="1"
						centered
						items={items}
						renderTabBar={(props, DefaultTabBar) => (
							<ConfigProvider
								theme={{
									components: {
										Tabs: {
											itemSelectedColor: '#ff4d4f',
											inkBarColor: '#ff4d4f',
											itemHoverColor: '#ff7875',
										},
									},
								}}
							>
								<DefaultTabBar {...props} />
							</ConfigProvider>
						)}
					/>
				</div>
			</Flex>
		</Card>
	);
}
