'use client';

import React from 'react';
import { Button, Flex, Tooltip } from 'antd';

interface RatingBarProps {
	onRate: (rating: number) => void;
	disabled?: boolean;
}

export default function RatingBar({ onRate, disabled }: RatingBarProps) {
	// Keyboard shortcuts will be handled by parent page
	return (
		<Flex
			justify="center"
			gap="middle"
			style={{
				marginTop: 32,
				padding: '16px 24px',
				background: '#fff',
				borderRadius: 16,
				boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
			}}
		>
			<Tooltip title="Shortcut: 1">
				<Button
					size="large"
					onClick={() => onRate(1)}
					disabled={disabled}
					style={{ borderColor: '#E64A19', color: '#E64A19', minWidth: 100 }}
				>
					Again (1)
				</Button>
			</Tooltip>

			<Tooltip title="Shortcut: 2">
				<Button
					size="large"
					onClick={() => onRate(2)}
					disabled={disabled}
					style={{ borderColor: '#FAAD14', color: '#FAAD14', minWidth: 100 }}
				>
					Hard (2)
				</Button>
			</Tooltip>

			<Tooltip title="Shortcut: 3">
				<Button
					type="primary"
					size="large"
					onClick={() => onRate(3)}
					disabled={disabled}
					style={{ background: '#708238', minWidth: 120 }}
				>
					Good (3)
				</Button>
			</Tooltip>

			<Tooltip title="Shortcut: 4">
				<Button
					size="large"
					onClick={() => onRate(4)}
					disabled={disabled}
					style={{ borderColor: '#1E3A5F', color: '#1E3A5F', minWidth: 100 }}
				>
					Easy (4)
				</Button>
			</Tooltip>
		</Flex>
	);
}
