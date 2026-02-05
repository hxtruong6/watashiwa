'use client';

import { Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

import { getExampleForScript } from '../data/exampleWords';
import type { KanaGrid, KanaScript } from '../types';
import { ExampleWordPopover } from './ExampleWordPopover';
import { KanaCell } from './KanaCell';

const { useToken } = theme;
const { Text } = Typography;

const NOOP_PLAY: (text: string) => void = () => {};

export interface KanaTableProps {
	grid: KanaGrid;
	/** Optional: set of cell ids to highlight (Stage 3 search). */
	highlightSet?: Set<string>;
	/** Optional: called when a cell is tapped (Stage 2 copy / Stage 4 audio). */
	onCellClick?: (cellId: string, character: string, romaji: string) => void;
	/** Script for aria caption and cell labels. */
	script: KanaScript;
	/** When false, hide romaji in each cell. */
	showRomaji?: boolean;
	/** When true, wrap cells in example word popover. */
	showExampleWords?: boolean;
	/** Play function from page useKanaAudio – used for popover "Play" so voice/speed match. */
	onPlayWord?: (text: string) => void;
}

export function KanaTable({
	grid,
	highlightSet,
	onCellClick,
	script,
	showRomaji = true,
	showExampleWords = false,
	onPlayWord,
}: KanaTableProps) {
	const { token } = useToken();
	const t = useTranslations('KanaReference');
	const scriptLabel = script === 'hiragana' ? t('hiragana') : t('katakana');

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
				aria-label={scriptLabel}
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
										<ExampleWordPopover
											enabled={showExampleWords}
											example={getExampleForScript(cell.romaji, script)}
											onPlayWord={onPlayWord ?? NOOP_PLAY}
										>
											<KanaCell
												character={cell.character}
												romaji={cell.romaji}
												showRomaji={showRomaji}
												ariaLabel={`${scriptLabel} ${cell.character}, romaji ${cell.romaji}`}
												highlighted={highlightSet?.has(cell.id)}
												onClick={
													onCellClick
														? () => onCellClick(cell.id, cell.character, cell.romaji)
														: undefined
												}
											/>
										</ExampleWordPopover>
									) : (
										<div
											style={{
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
