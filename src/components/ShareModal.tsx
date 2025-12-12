'use client';

import React, { useState } from 'react';
import { Modal, Typography, Flex, Input, Button, Tooltip, Space } from 'antd';
import {
	CopyOutlined,
	CheckOutlined,
	ShareAltOutlined,
	FacebookFilled,
	TwitterSquareFilled,
	LinkedinFilled,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Title, Paragraph, Text } = Typography;

interface ShareModalProps {
	open: boolean;
	onCancel: () => void;
}

export default function ShareModal({ open, onCancel }: ShareModalProps) {
	const t = useTranslations('Share');
	const [copied, setCopied] = useState(false);
	const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://watashiwa.app';

	const handleCopy = () => {
		navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const shareToSocial = (platform: 'facebook' | 'twitter' | 'linkedin') => {
		let url = '';
		const text = t('hook');
		switch (platform) {
			case 'facebook':
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
				break;
			case 'twitter':
				url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
					shareUrl,
				)}&text=${encodeURIComponent(text)}`;
				break;
			case 'linkedin':
				url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
				break;
		}
		window.open(url, '_blank', 'width=600,height=400');
	};

	return (
		<Modal
			open={open}
			onCancel={onCancel}
			footer={null}
			centered
			width={480}
			title={
				<Flex align="center" gap="small">
					<ShareAltOutlined style={{ color: '#1E3A5F' }} />
					<span>{t('title')}</span>
				</Flex>
			}
		>
			<Flex vertical gap="large" style={{ padding: '12px 0' }}>
				<div
					style={{
						background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
						padding: '20px',
						borderRadius: 12,
						textAlign: 'center',
						border: '1px solid #d6e4ff',
					}}
				>
					<Title level={4} style={{ marginBottom: 8, color: '#1E3A5F' }}>
						✨ WatashiWa
					</Title>
					<Paragraph style={{ marginBottom: 0, fontSize: 15, color: '#444' }}>
						{t('hook')}
					</Paragraph>
				</div>

				<Flex vertical gap="small">
					<Text strong>{t('copyLink')}</Text>
					<Space.Compact style={{ width: '100%' }}>
						<Input value={shareUrl} readOnly />
						<Tooltip title={copied ? t('copied') : t('copyLink')}>
							<Button
								type="primary"
								icon={copied ? <CheckOutlined /> : <CopyOutlined />}
								onClick={handleCopy}
								style={{ background: copied ? '#52c41a' : '#1E3A5F' }}
							>
								{copied ? t('copied') : 'Copy'}
							</Button>
						</Tooltip>
					</Space.Compact>
				</Flex>

				<Flex justify="center" gap="large" style={{ marginTop: 8 }}>
					<Tooltip title="Share on Facebook">
						<Button
							shape="circle"
							icon={<FacebookFilled style={{ fontSize: 20, color: '#1877F2' }} />}
							size="large"
							onClick={() => shareToSocial('facebook')}
						/>
					</Tooltip>
					<Tooltip title="Share on X (Twitter)">
						<Button
							shape="circle"
							icon={<TwitterSquareFilled style={{ fontSize: 20, color: '#000' }} />}
							size="large"
							onClick={() => shareToSocial('twitter')}
						/>
					</Tooltip>
					<Tooltip title="Share on LinkedIn">
						<Button
							shape="circle"
							icon={<LinkedinFilled style={{ fontSize: 20, color: '#0A66C2' }} />}
							size="large"
							onClick={() => shareToSocial('linkedin')}
						/>
					</Tooltip>
				</Flex>
			</Flex>
		</Modal>
	);
}
