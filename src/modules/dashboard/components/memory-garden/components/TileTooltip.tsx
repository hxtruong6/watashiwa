/**
 * TileTooltip Component
 *
 * Displays rich information about a hovered tile.
 * Uses Html from @react-three/drei for 2D overlay.
 */
import { Html } from '@react-three/drei';
import { theme } from 'antd';
import React from 'react';
import * as THREE from 'three';

import type { MemoryTile } from '../types';

const { useToken } = theme;

export interface TileTooltipProps {
	tile: MemoryTile;
	position: THREE.Vector3;
	visible: boolean;
}

/**
 * Tooltip component for displaying tile information
 */
export function TileTooltip({ tile, position, visible }: TileTooltipProps) {
	const { token } = useToken();

	if (!visible || !tile) {
		return null;
	}

	// Format stability as days
	const stabilityDays = Math.floor(tile.stability);
	const stabilityText = stabilityDays === 0 ? 'New' : `${stabilityDays} days`;

	return (
		<Html
			position={[position.x, position.y + 1, position.z]}
			center
			style={{
				pointerEvents: 'none',
				userSelect: 'none',
			}}
		>
			<div
				style={{
					background: token.colorBgElevated,
					border: `1px solid ${token.colorBorder}`,
					borderRadius: 8,
					padding: '12px 16px',
					minWidth: 200,
					boxShadow: token.boxShadow,
					fontSize: token.fontSizeSM,
					color: token.colorText,
				}}
			>
				<div style={{ fontWeight: token.fontWeightStrong, marginBottom: 8 }}>
					{tile.wordSurface}
				</div>
				<div style={{ color: token.colorTextSecondary, fontSize: token.fontSizeSM - 1 }}>
					{tile.meaning}
				</div>
				<div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: token.fontSizeSM - 1 }}>
					<div>
						<span style={{ color: token.colorTextSecondary }}>Stability: </span>
						<span style={{ fontWeight: token.fontWeightStrong }}>{stabilityText}</span>
					</div>
					{tile.isLeech && (
						<div style={{ color: token.colorError }}>
							<span>⚠️ Leech</span>
						</div>
					)}
				</div>
				{tile.lapses > 0 && (
					<div
						style={{
							marginTop: 4,
							fontSize: token.fontSizeSM - 1,
							color: token.colorTextSecondary,
						}}
					>
						Lapses: {tile.lapses}
					</div>
				)}
			</div>
		</Html>
	);
}
