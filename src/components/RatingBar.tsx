'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';

interface RatingBarProps {
	onRate: (rating: number) => void;
	disabled?: boolean;
}

export default function RatingBar({ onRate, disabled }: RatingBarProps) {
	return (
		<div
			style={{
				marginTop: 16,
				padding: '16px',
				background: 'rgba(255, 255, 255, 0.9)',
				borderRadius: 24,
				boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
				backdropFilter: 'blur(8px)',
				width: '100%',
				maxWidth: 500,
			}}
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 12,
				}}
			>
				<Tooltip title="Shortcut: 1">
					<Button
						size="large"
						onClick={() => onRate(1)}
						disabled={disabled}
						style={{
							borderColor: '#E64A19',
							color: '#E64A19',
							height: 56,
							fontSize: 16,
							fontWeight: 600,
							gridColumn: '1 / 2',
						}}
					>
						Again (1)
					</Button>
				</Tooltip>

				<Tooltip title="Shortcut: 2">
					<Button
						size="large"
						onClick={() => onRate(2)}
						disabled={disabled}
						style={{
							borderColor: '#FAAD14',
							color: '#FAAD14',
							height: 56,
							fontSize: 16,
							fontWeight: 600,
							gridColumn: '2 / 3',
						}}
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
						style={{
							background: '#708238', // Muted green
							height: 56,
							fontSize: 16,
							fontWeight: 600,
							gridColumn: '1 / 2',
						}}
					>
						Good (3)
					</Button>
				</Tooltip>

				<Tooltip title="Shortcut: 4">
					<Button
						size="large"
						onClick={() => onRate(4)}
						disabled={disabled}
						style={{
							borderColor: '#1E3A5F',
							color: '#1E3A5F',
							height: 56,
							fontSize: 16,
							fontWeight: 600,
							gridColumn: '2 / 3',
						}}
					>
						Easy (4)
					</Button>
				</Tooltip>
			</div>

			{/* Desktop optimization: Use a single row if screen is wide enough? 
                 Actually, grid is fine for desktop too if keys are 1-4. 
                 But user wanted "1, 2, 3, 4" order. The grid above is:
                 [Again] [Hard]
                 [Good]  [Easy]
                 This maps top-left, top-right, bottom-left, bottom-right.
                 Maybe a single row is better on desktop, but grid on mobile.
                 We can use Flex with wrap and calculated widths.
            */}
			<style jsx>{`
				@media (min-width: 600px) {
					div[style*='gridTemplateColumns'] {
						display: flex !important;
						justify-content: space-between;
					}
					button {
						flex: 1;
						margin: 0 6px;
					}
				}
			`}</style>
		</div>
	);
}
