/**
 * Caption Toggle Component
 *
 * Toggle closed captions/subtitles on/off
 * Supports WebVTT tracks
 */
'use client';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { memo, useCallback } from 'react';

interface CaptionToggleProps {
	isEnabled: boolean;
	onToggle: (enabled: boolean) => void;
	trackCount?: number;
}

function CaptionToggleComponent({ isEnabled, onToggle, trackCount = 0 }: CaptionToggleProps) {
	const handleToggle = useCallback(() => {
		onToggle(!isEnabled);
	}, [isEnabled, onToggle]);

	// Don't show if no tracks available
	if (trackCount === 0) {
		return null;
	}

	return (
		<Tooltip title={isEnabled ? 'Hide captions' : 'Show captions'}>
			<Button
				type={isEnabled ? 'primary' : 'default'}
				icon={isEnabled ? <CheckOutlined /> : <CloseOutlined />}
				onClick={handleToggle}
				aria-label={isEnabled ? 'Hide captions' : 'Show captions'}
				aria-pressed={isEnabled}
				style={{
					minWidth: '48px',
					minHeight: '48px', // Mobile touch target
					touchAction: 'manipulation',
				}}
			>
				CC
			</Button>
		</Tooltip>
	);
}

export const CaptionToggle = memo(CaptionToggleComponent);
