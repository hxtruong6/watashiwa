'use client';

import { GraphNode } from '../../types';

interface WordNodeProps {
	data: GraphNode['data'];
	selected?: boolean;
}

export function WordNode({ data, selected }: WordNodeProps) {
	const { wordSurface, wordReading, meanings } = data;

	// Get first meaning for display
	const displayMeaning = meanings ? Object.values(meanings)[0]?.[0] || '' : '';

	return (
		<div
			style={{
				padding: '12px 16px',
				backgroundColor: selected ? '#e6f7ff' : '#fff',
				border: `2px solid ${selected ? '#1890ff' : '#d9d9d9'}`,
				borderRadius: '8px',
				minWidth: '120px',
				textAlign: 'center',
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				cursor: 'pointer',
			}}
		>
			<div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{wordSurface}</div>
			<div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{wordReading}</div>
			{displayMeaning && <div style={{ fontSize: '12px', color: '#999' }}>{displayMeaning}</div>}
		</div>
	);
}
