/**
 * DeckView - Content List View Component
 *
 * Table layout for displaying vocab items
 */
import { Empty, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import type { ContentType, VocabularyItem } from '../../types';

interface ContentListViewProps {
	type: ContentType;
	data: VocabularyItem[];
	columns: ColumnsType<VocabularyItem>;
	onRowClick: (item: VocabularyItem, type: ContentType) => void;
	currentPlayingWordId?: string | null;
}

export function ContentListView({
	type,
	data,
	columns,
	onRowClick,
	currentPlayingWordId,
}: ContentListViewProps) {
	const t = useTranslations('Decks');
	const tableRef = useRef<HTMLDivElement>(null);

	// Scroll to current playing word
	useEffect(() => {
		if (currentPlayingWordId && tableRef.current) {
			const rowElement = tableRef.current.querySelector(
				`[data-row-key="${currentPlayingWordId}"]`,
			) as HTMLElement;
			if (rowElement) {
				rowElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest',
				});
			}
		}
	}, [currentPlayingWordId]);

	if (!data || data.length === 0) {
		return <Empty description={t('noItems', { type })} />;
	}

	return (
		<div ref={tableRef}>
			<Table
				columns={columns}
				dataSource={data}
				rowKey="id"
				pagination={{ pageSize: 20 }}
				onRow={(record) => ({
					onClick: () => onRowClick(record, type),
					style: {
						cursor: 'pointer',
						backgroundColor:
							currentPlayingWordId === record.id ? 'rgba(22, 119, 255, 0.1)' : undefined,
						borderLeft: currentPlayingWordId === record.id ? '3px solid #1677ff' : undefined,
						transition: 'all 0.3s ease',
					},
					'data-row-key': record.id,
				})}
			/>
		</div>
	);
}
