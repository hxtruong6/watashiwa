/**
 * DeckView - Table Column Definitions
 *
 * Extracted column definitions for vocab tables
 */
import { CommentOutlined } from '@ant-design/icons';
import { Button, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';

import type { VocabularyItem } from '../../types';

const { Text } = Typography;
const { useToken } = theme;

export function useVocabColumns(
	onCommentClick: (record: VocabularyItem) => void,
): ColumnsType<VocabularyItem> {
	const t = useTranslations('Decks');
	const { token } = useToken();

	return [
		{
			title: t('columnWord'),
			dataIndex: 'wordSurface',
			key: 'wordSurface',
			render: (text: string, record: VocabularyItem) => (
				<div>
					<Text strong style={{ fontSize: 16 }}>
						{text}
					</Text>
					<div style={{ fontSize: 12, color: token.colorTextSecondary }}>{record.wordReading}</div>
				</div>
			),
			sorter: (a, b) => a.wordSurface.localeCompare(b.wordSurface),
		},
		{
			title: t('columnMeaning'),
			dataIndex: 'meanings',
			key: 'meanings',
			render: (_: unknown, record: VocabularyItem) => {
				const meaning = record.meanings?.vi?.[0] || record.meanings?.en?.[0] || '';
				return meaning;
			},
			sorter: (a, b) => {
				const aMeaning = a.meanings?.vi?.[0] || a.meanings?.en?.[0] || '';
				const bMeaning = b.meanings?.vi?.[0] || b.meanings?.en?.[0] || '';
				return aMeaning.localeCompare(bMeaning);
			},
		},
		{
			title: t('columnHanViet'),
			dataIndex: 'hanViet',
			key: 'hanViet',
			responsive: ['sm'],
		},
		{
			title: t('columnStatus'),
			key: 'actions',
			width: 80,
			render: (_: unknown, record: VocabularyItem) => (
				<Button
					type="text"
					icon={<CommentOutlined />}
					onClick={(e) => {
						e.stopPropagation();
						onCommentClick(record);
					}}
				/>
			),
		},
	];
}
