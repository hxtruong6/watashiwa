/**
 * PrimingModal Component
 *
 * Smart modal that shows value proposition before story
 * Only shown once per user (tracked in localStorage)
 */

'use client';

import { trackEvent } from '@/lib/analytics';
import { BookOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Flex, Modal, Typography } from 'antd';
import { useCallback } from 'react';

const { Title, Paragraph, Text } = Typography;

interface PrimingModalProps {
	open: boolean;
	onRead: () => void;
	onSkip: () => void;
	unitId?: string;
}

const STORAGE_KEY = 'watashiwa_priming_modal_seen';

/**
 * Check if user has seen the priming modal before
 */
export function hasSeenPrimingModal(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Mark priming modal as seen
 */
export function markPrimingModalSeen(): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, 'true');
}

export function PrimingModal({ open, onRead, onSkip, unitId }: PrimingModalProps) {
	const handleRead = useCallback(() => {
		// Mark as seen so modal doesn't show again
		markPrimingModalSeen();

		// Track analytics
		trackEvent('PRIMING_MODAL_READ_CLICKED', {
			unit_id: unitId,
		});

		onRead();
	}, [onRead, unitId]);

	const handleSkip = useCallback(() => {
		// Mark as seen so modal doesn't show again
		markPrimingModalSeen();

		// Track analytics
		trackEvent('PRIMING_MODAL_SKIP_CLICKED', {
			unit_id: unitId,
		});

		onSkip();
	}, [onSkip, unitId]);

	return (
		<Modal
			open={open}
			onCancel={handleSkip}
			footer={null}
			centered
			width={480}
			maskClosable={false}
			closable={true}
		>
			<Flex vertical align="center" gap="large" style={{ padding: '24px 0' }}>
				{/* Icon */}
				<div
					style={{
						width: 80,
						height: 80,
						borderRadius: '50%',
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 8,
					}}
				>
					<BookOutlined style={{ fontSize: 40, color: '#fff' }} />
				</div>

				{/* Title */}
				<Title level={3} style={{ margin: 0, textAlign: 'center' }}>
					Boost Your Retention +50%
				</Title>

				{/* Description */}
				<Paragraph
					type="secondary"
					style={{
						textAlign: 'center',
						margin: 0,
						fontSize: 15,
						lineHeight: 1.6,
						maxWidth: 400,
					}}
				>
					Read the story first to prime your brain with context. This helps you remember words
					longer and makes learning more engaging.
				</Paragraph>

				{/* Benefits */}
				<Flex vertical gap="small" style={{ width: '100%', marginTop: 8 }}>
					<Flex align="center" gap="small">
						<RocketOutlined style={{ color: '#52c41a', fontSize: 16 }} />
						<Text style={{ fontSize: 14 }}>Interactive keywords you can tap to hear</Text>
					</Flex>
					<Flex align="center" gap="small">
						<RocketOutlined style={{ color: '#52c41a', fontSize: 16 }} />
						<Text style={{ fontSize: 14 }}>First card will be from the story (Recency Effect)</Text>
					</Flex>
					<Flex align="center" gap="small">
						<RocketOutlined style={{ color: '#52c41a', fontSize: 16 }} />
						<Text style={{ fontSize: 14 }}>Only takes 2-3 minutes</Text>
					</Flex>
				</Flex>

				{/* Actions */}
				<Flex gap="middle" style={{ width: '100%', marginTop: 16 }}>
					<Button
						onClick={handleSkip}
						style={{
							flex: 1,
							height: 44,
						}}
					>
						Skip to Cards
					</Button>
					<Button
						type="primary"
						onClick={handleRead}
						style={{
							flex: 1,
							height: 44,
							fontWeight: 600,
						}}
						icon={<BookOutlined />}
					>
						Read Story
					</Button>
				</Flex>

				{/* Helper text */}
				<Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
					You won&apos;t see this again. You can always skip stories later.
				</Text>
			</Flex>
		</Modal>
	);
}
