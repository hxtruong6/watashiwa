/**
 * GardenControls Component
 *
 * UI controls for filtering and interacting with the Memory Garden.
 * Includes filter toggles and zoom controls.
 */
import { ZoomOutOutlined } from '@ant-design/icons';
import { Button, Radio, Space } from 'antd';
import React from 'react';

export type GardenFilter = 'all' | 'leeches' | 'mastered' | 'new';

export interface GardenControlsProps {
	filter: GardenFilter;
	onFilterChange: (filter: GardenFilter) => void;
	onZoomReset?: () => void;
	showZoomControls?: boolean;
}

/**
 * Control panel for Memory Garden
 */
export function GardenControls({
	filter,
	onFilterChange,
	onZoomReset,
	showZoomControls = true,
}: GardenControlsProps) {
	return (
		<div
			style={{
				position: 'absolute',
				top: 16,
				left: 16,
				zIndex: 10,
				background: 'rgba(255, 255, 255, 0.95)',
				padding: '12px 16px',
				borderRadius: 8,
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
			}}
		>
			<Space direction="vertical" size="small">
				<div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Filter</div>
				<Radio.Group
					value={filter}
					onChange={(e) => onFilterChange(e.target.value)}
					size="small"
					buttonStyle="solid"
				>
					<Radio.Button value="all">All</Radio.Button>
					<Radio.Button value="leeches">Leeches</Radio.Button>
					<Radio.Button value="mastered">Mastered</Radio.Button>
					<Radio.Button value="new">New</Radio.Button>
				</Radio.Group>
				{showZoomControls && onZoomReset && (
					<Button
						size="small"
						icon={<ZoomOutOutlined />}
						onClick={onZoomReset}
						style={{ marginTop: 8 }}
					>
						Reset View
					</Button>
				)}
			</Space>
		</div>
	);
}
