'use client';

import { Typography, theme } from 'antd';
import React from 'react';

import type { KanaGrid } from '../types';
import { KanaCell } from './KanaCell';

const { useToken } = theme;
const { Text } = Typography;

export interface KanaTableProps {
	grid: KanaGrid;
	/** Optional: set of cell ids to highlight (Stage 3 search). */
	highlightSet?: Set<string>;
	/** Optional: called when a cell is tapped (Stage 2 copy / Stage 4 audio). */
	onCellClick?: (cellId: string, character: string, romaji: string) => void;
	/** Script for aria caption and cell labels. */
	script: 'hiragana' | 'katakana';
}

export function KanaTable({ grid, highlightSet, onCellClick, script }: KanaTableProps) {
	const { token } = useToken();
	const scriptLabel = script === 'hiragana' ? 'Hiragana' : 'Katakana';

	return (
		<div
			style={{
				overflowX: 'auto',
				borderRadius: token.borderRadiusLG,
				border: `1px solid ${token.colorBorderSecondary}`,
				backgroundColor: token.colorBgContainer,
			}}
		>
			<table
				role="grid"
				aria-label={`${scriptLabel} basic chart`}
				style={{
					width: '100%',
					borderCollapse: 'collapse',
					minWidth: 320,
				}}
			>
				<thead>
					<tr>
						<th
							scope="col"
							style={{
								width: 30,
								padding: token.paddingXS,
								textAlign: 'center',
								fontWeight: 600,
								fontSize: token.fontSizeSM,
								color: token.colorTextSecondary,
								backgroundColor: token.colorFillQuaternary,
								borderBottom: `1px solid ${token.colorBorderSecondary}`,
								borderRight: `1px solid ${token.colorBorderSecondary}`,
							}}
						>
							{' '}
						</th>
						{grid.columnHeaders.map((col) => (
							<th
								key={col}
								scope="col"
								style={{
									padding: token.paddingXS,
									textAlign: 'center',
									fontWeight: 600,
									fontSize: token.fontSizeSM,
									color: token.colorTextSecondary,
									backgroundColor: token.colorFillQuaternary,
									borderBottom: `1px solid ${token.colorBorderSecondary}`,
									borderRight: `1px solid ${token.colorBorderSecondary}`,
								}}
							>
								<Text type="secondary">{col}</Text>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{grid.rows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							<th
								scope="row"
								style={{
									padding: token.paddingXS,
									textAlign: 'center',
									fontWeight: 600,
									fontSize: token.fontSizeSM,
									color: token.colorTextSecondary,
									backgroundColor: token.colorFillQuaternary,
									borderBottom: `1px solid ${token.colorBorderSecondary}`,
									borderRight: `1px solid ${token.colorBorderSecondary}`,
								}}
							>
								<Text type="secondary">{row.rowHeader}</Text>
							</th>
							{row.cells.map((cell, colIndex) => (
								<td
									key={colIndex}
									style={{
										padding: token.paddingXS,
										borderBottom: `1px solid ${token.colorBorderSecondary}`,
										borderRight: `1px solid ${token.colorBorderSecondary}`,
										verticalAlign: 'middle',
									}}
								>
									{cell ? (
										<KanaCell
											character={cell.character}
											romaji={cell.romaji}
											ariaLabel={`${scriptLabel} ${cell.character}, romaji ${cell.romaji}`}
											highlighted={highlightSet?.has(cell.id)}
											onClick={
												onCellClick
													? () => onCellClick(cell.id, cell.character, cell.romaji)
													: undefined
											}
										/>
									) : (
										<div
											style={{
												// backgroundColor: token.colorFillQuaternary,
												borderRadius: token.borderRadius,
											}}
											aria-hidden
										/>
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
