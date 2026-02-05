'use client';

import { Typography, theme } from 'antd';
import React from 'react';

const { useToken } = theme;
const { Text } = Typography;

export interface KanaCellProps {
	character: string;
	romaji: string;
	/** When false, hide romaji in cell (aria-label still includes it for a11y). Stage 4 */
	showRomaji?: boolean;
	/** Optional: for Stage 2 copy / Stage 4 audio */
	onClick?: () => void;
	/** Accessible label, e.g. "Hiragana か, romaji ka" */
	ariaLabel?: string;
	/** When true, cell is highlighted (e.g. search match). Stage 3 */
	highlighted?: boolean;
}

export function KanaCell({
	character,
	romaji,
	showRomaji = true,
	onClick,
	ariaLabel,
	highlighted = false,
}: KanaCellProps) {
	const { token } = useToken();

	const content = (
		<>
			<Text
				strong
				style={{
					display: 'block',
					fontSize: token.fontSizeHeading3,
					lineHeight: 1.2,
					color: token.colorText,
				}}
			>
				{character}
			</Text>
			{showRomaji && (
				<Text
					style={{
						display: 'block',
						fontSize: token.fontSizeSM,
						color: token.colorTextSecondary,
						fontStyle: 'italic',
						marginTop: token.marginXXS,
					}}
				>
					{romaji}
				</Text>
			)}
		</>
	);

	const baseStyle: React.CSSProperties = {
		minWidth: 56,
		minHeight: 56,
		padding: token.paddingSM,
		textAlign: 'center',
		borderRadius: token.borderRadius,
		backgroundColor: highlighted ? token.colorPrimaryBg : token.colorFillQuaternary,
		border: `1px solid ${token.colorBorderSecondary}`,
		cursor: onClick ? 'pointer' : 'default',
		transition: 'background-color 0.2s, border-color 0.2s',
	};

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				aria-label={ariaLabel ?? `${character}, ${romaji}`}
				style={baseStyle}
				onMouseEnter={(e) => {
					if (!highlighted) {
						e.currentTarget.style.backgroundColor = token.colorFillTertiary;
						e.currentTarget.style.borderColor = token.colorBorder;
					}
				}}
				onMouseLeave={(e) => {
					if (!highlighted) {
						e.currentTarget.style.backgroundColor = token.colorFillQuaternary;
						e.currentTarget.style.borderColor = token.colorBorderSecondary;
					}
				}}
				onFocus={(e) => {
					e.currentTarget.style.outline = `2px solid ${token.colorPrimary}`;
					e.currentTarget.style.outlineOffset = '2px';
				}}
				onBlur={(e) => {
					e.currentTarget.style.outline = 'none';
					e.currentTarget.style.outlineOffset = '0';
				}}
			>
				{content}
			</button>
		);
	}

	return (
		<div role="cell" aria-label={ariaLabel ?? `${character}, ${romaji}`} style={baseStyle}>
			{content}
		</div>
	);
}
