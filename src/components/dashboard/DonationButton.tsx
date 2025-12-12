'use client';

import React, { useState } from 'react';
import { FloatButton, Modal, Tabs, Typography, Flex, Tooltip, ConfigProvider, Image } from 'antd';
import { HeartFilled, CopyOutlined, CheckOutlined, BankOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const { Text, Paragraph, Title } = Typography;

// Animation variants for the button
const buttonVariants = {
	initial: { scale: 0.8, opacity: 0 },
	animate: {
		scale: 1,
		opacity: 1,
		transition: { duration: 0.3 },
	},
	pulse: {
		scale: 1,
		boxShadow: [
			'0 0 0 0 rgba(255, 77, 79, 0.4)',
			'0 0 0 10px rgba(255, 77, 79, 0)',
			'0 0 0 0 rgba(255, 77, 79, 0)',
		],
		transition: {
			duration: 2,
			repeat: Infinity,
			repeatDelay: 1,
		},
	},
	hover: {
		scale: 1.1,
		boxShadow: '0 0 0 0 rgba(255, 77, 79, 0)', // Clear pulse ring on hover
		transition: { duration: 0.2 },
	},
};

export function DonationButton() {
	const [isOpen, setIsOpen] = useState(false);
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
		<>
			<AnimatePresence>
				<motion.div
					variants={buttonVariants}
					initial="initial"
					animate="animate"
					whileHover="hover"
					// We apply the pulse animation to the button container
					style={{
						position: 'fixed',
						bottom: 40,
						right: 40,
						zIndex: 100,
					}}
				>
					{/* Inner motion div for the continuous pulse to avoid conflict with hover */}
					<motion.div variants={buttonVariants} animate="pulse">
						<FloatButton
							icon={<HeartFilled style={{ color: '#fff' }} />}
							type="primary"
							style={{
								width: 56,
								height: 56,
								// Override default primary color for this button specifically to be more "love" themed
								backgroundColor: '#FF4D4F',
							}}
							onClick={() => setIsOpen(true)}
							tooltip="Support Dev"
						/>
					</motion.div>
				</motion.div>
			</AnimatePresence>

			<Modal
				title={null}
				open={isOpen}
				onCancel={() => setIsOpen(false)}
				footer={null}
				centered
				width={420}
				maskClosable={true}
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
			</Modal>
		</>
	);
}

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
