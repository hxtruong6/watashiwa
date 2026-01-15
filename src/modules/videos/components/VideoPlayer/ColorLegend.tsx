/**
 * Color Legend Component
 *
 * Tooltip/info explaining word color coding system
 */
'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, Typography } from 'antd';
import { memo } from 'react';

const { Text } = Typography;

const COLOR_LEGEND_CONTENT = (
	<div style={{ maxWidth: '250px' }}>
		<Text strong style={{ display: 'block', marginBottom: '8px' }}>
			Word Color Coding:
		</Text>
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span
					style={{
						display: 'inline-block',
						width: '16px',
						height: '16px',
						backgroundColor: 'rgba(255, 235, 59, 0.2)',
						borderRadius: '4px',
						border: '1px solid rgba(255, 235, 59, 0.4)',
					}}
				/>
				<Text style={{ fontSize: '12px' }}>Yellow - Beginner</Text>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span
					style={{
						display: 'inline-block',
						width: '16px',
						height: '16px',
						backgroundColor: 'rgba(76, 175, 80, 0.2)',
						borderRadius: '4px',
						border: '1px solid rgba(76, 175, 80, 0.4)',
					}}
				/>
				<Text style={{ fontSize: '12px' }}>Green - Intermediate</Text>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span
					style={{
						display: 'inline-block',
						width: '16px',
						height: '16px',
						backgroundColor: 'rgba(156, 39, 176, 0.2)',
						borderRadius: '4px',
						border: '1px solid rgba(156, 39, 176, 0.4)',
					}}
				/>
				<Text style={{ fontSize: '12px' }}>Purple - Advanced</Text>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span
					style={{
						display: 'inline-block',
						width: '16px',
						height: '16px',
						backgroundColor: 'rgba(244, 67, 54, 0.2)',
						borderRadius: '4px',
						border: '1px solid rgba(244, 67, 54, 0.4)',
					}}
				/>
				<Text style={{ fontSize: '12px' }}>Red - Difficult</Text>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span
					style={{
						display: 'inline-block',
						width: '16px',
						height: '16px',
						backgroundColor: 'rgba(33, 150, 243, 0.2)',
						borderRadius: '4px',
						border: '1px solid rgba(33, 150, 243, 0.4)',
					}}
				/>
				<Text style={{ fontSize: '12px' }}>Blue - Common</Text>
			</div>
		</div>
	</div>
);

function ColorLegendComponent() {
	return (
		<Popover content={COLOR_LEGEND_CONTENT} title="Word Color Guide" trigger="hover">
			<InfoCircleOutlined
				style={{
					fontSize: '16px',
					color: 'rgba(0, 0, 0, 0.45)',
					cursor: 'help',
				}}
				aria-label="Word color coding legend"
			/>
		</Popover>
	);
}

export const ColorLegend = memo(ColorLegendComponent);
