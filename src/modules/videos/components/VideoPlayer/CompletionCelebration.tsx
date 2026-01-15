/**
 * Completion Celebration Component
 *
 * Modal that celebrates video completion with statistics
 */
'use client';

import { CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { Button, Modal, Statistic, Typography } from 'antd';
import { memo } from 'react';

const { Title, Paragraph } = Typography;

interface CompletionCelebrationProps {
	open: boolean;
	watchTime: number; // in seconds
	onClose: () => void;
	onNextVideo?: () => void;
	onReview?: () => void;
}

/**
 * Format seconds to human-readable time
 */
function formatWatchTime(seconds: number): string {
	if (seconds < 60) {
		return `${seconds} seconds`;
	}
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes < 60) {
		return remainingSeconds > 0
			? `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`
			: `${minutes} minute${minutes > 1 ? 's' : ''}`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return remainingMinutes > 0
		? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`
		: `${hours} hour${hours > 1 ? 's' : ''}`;
}

function CompletionCelebrationComponent({
	open,
	watchTime,
	onClose,
	onNextVideo,
	onReview,
}: CompletionCelebrationProps) {
	return (
		<Modal
			open={open}
			title={
				<div style={{ textAlign: 'center', padding: '16px 0' }}>
					<TrophyOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '8px' }} />
					<Title level={3} style={{ margin: 0 }}>
						Congratulations!
					</Title>
				</div>
			}
			onCancel={onClose}
			footer={[
				onReview && (
					<Button key="review" onClick={onReview}>
						Review Video
					</Button>
				),
				onNextVideo && (
					<Button key="next" type="primary" onClick={onNextVideo}>
						Next Video
					</Button>
				),
				<Button key="close" onClick={onClose}>
					Close
				</Button>,
			].filter(Boolean)}
			centered
			width={400}
			aria-labelledby="completion-title"
			aria-describedby="completion-description"
		>
			<div id="completion-description" style={{ textAlign: 'center' }}>
				<CheckCircleOutlined
					style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }}
					aria-hidden="true"
				/>
				<Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
					You&apos;ve completed this video!
				</Paragraph>

				<Statistic
					title="Total Watch Time"
					value={formatWatchTime(watchTime)}
					valueStyle={{ fontSize: '18px', fontWeight: 600 }}
				/>
			</div>
		</Modal>
	);
}

export const CompletionCelebration = memo(CompletionCelebrationComponent);
