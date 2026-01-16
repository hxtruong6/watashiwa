'use client';

import { GraphNode } from '../../types';

interface KanjiNodeProps {
	data: GraphNode['data'];
	selected?: boolean;
}

export function KanjiNode({ data, selected }: KanjiNodeProps) {
	const { character, meaningVi, meaningEn, hanViet, jlptLevel } = data;

	// Get meaning for display (prefer Vietnamese, fallback to English)
	const displayMeaning = meaningVi || meaningEn || '';

	return (
		<div
			style={{
				width: '80px',
				height: '80px',
				padding: '8px',
				backgroundColor: selected ? '#fff0f6' : '#fff',
				border: `3px solid ${selected ? '#eb2f96' : '#d9d9d9'}`,
				borderRadius: '8px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				cursor: 'pointer',
				transform: 'rotate(2deg)', // Slight rotation for dynamism
			}}
		>
			<div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{character}</div>
			{displayMeaning && (
				<div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>{displayMeaning}</div>
			)}
			{hanViet && (
				<div
					style={{
						fontSize: '9px',
						color: '#1890ff',
						marginTop: '2px',
						fontWeight: 'bold',
					}}
				>
					{hanViet}
				</div>
			)}
			{jlptLevel && (
				<div
					style={{
						fontSize: '8px',
						color: '#999',
						marginTop: '2px',
					}}
				>
					N{jlptLevel}
				</div>
			)}
		</div>
	);
}
