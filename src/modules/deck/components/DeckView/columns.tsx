/**
 * DeckView - Table Column Definitions
 *
 * Extracted column definitions for vocab tables
 */
'use client';

import { useDismissibleTooltip } from '@/hooks/useDismissibleTooltip';
import { WordWithFurigana } from '@/modules/vocabulary/components/WordWithFurigana';
import { SoundOutlined } from '@ant-design/icons';
import { Button, Checkbox, Flex, Tooltip, theme } from 'antd';
import type { Breakpoint } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';

import type { VocabularyItem } from '../../types';

const AUDIO_PLAY_TOOLTIP_KEY = 'audio_play';

function AudioCell({
	record,
	isPlaying,
	onPlay,
	tooltip,
}: {
	record: VocabularyItem;
	isPlaying: boolean;
	onPlay: (record: VocabularyItem) => void;
	tooltip: string;
}) {
	const { token } = theme.useToken();
	const { showTooltip, onOpenChange } = useDismissibleTooltip(AUDIO_PLAY_TOOLTIP_KEY, {
		maxShows: 3,
	});
	return (
		<Tooltip title={showTooltip ? tooltip : undefined} onOpenChange={onOpenChange}>
			<Button
				type="text"
				size="small"
				icon={
					<SoundOutlined
						style={{
							color: isPlaying ? token.colorPrimary : undefined,
							opacity: isPlaying ? 1 : 0.6,
						}}
					/>
				}
				onClick={(e) => {
					e.stopPropagation();
					onPlay(record);
				}}
				aria-label={tooltip}
				style={{ minWidth: 32, minHeight: 32, padding: 0 }}
			/>
		</Tooltip>
	);
}

export interface UseVocabColumnsOptions {
	onCommentClick: (record: VocabularyItem) => void;
	onToggleLearnt?: (record: VocabularyItem, learnt: boolean) => void;
	/** When provided, used for checkbox checked state (e.g. optimistic overrides). Falls back to record.learnt */
	getLearnt?: (record: VocabularyItem) => boolean;
	/** Play TTS for this vocab (wordReading or wordSurface). When provided, Listen column is shown. */
	onPlayAudio?: (record: VocabularyItem) => void;
	/** ID of the row currently playing audio; used to show playing state. */
	currentPlayingWordId?: string | null;
}

export function useVocabColumns(
	onCommentClick: (record: VocabularyItem) => void,
	options?: Partial<UseVocabColumnsOptions>,
): ColumnsType<VocabularyItem> {
	const { onToggleLearnt, getLearnt, onPlayAudio, currentPlayingWordId } = options ?? {};
	const t = useTranslations('Decks');

	return [
		{
			title: t('columnWord'),
			dataIndex: 'wordSurface',
			key: 'wordSurface',
			render: (_: string, record: VocabularyItem) => (
				<WordWithFurigana
					wordSurface={record.wordSurface}
					wordReading={record.wordReading}
					furiganaMapping={record.furiganaMapping}
					showReadingLine={true}
				/>
			),
			sorter: (a, b) => a.wordSurface.localeCompare(b.wordSurface),
		},
		...(onPlayAudio
			? [
					{
						title: t('columnListen'),
						key: 'audio',
						width: 56,
						responsive: ['sm'] as Breakpoint[],
						render: (_: unknown, record: VocabularyItem) => (
							<AudioCell
								record={record}
								isPlaying={currentPlayingWordId === record.id}
								onPlay={onPlayAudio}
								tooltip={t('columnListenTooltip')}
							/>
						),
					},
				]
			: []),
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
			responsive: ['sm'] as Breakpoint[],
		},
		{
			title: t('columnStatus'),
			key: 'actions',
			width: 100,
			render: (_: unknown, record: VocabularyItem) => {
				const learntChecked = getLearnt ? getLearnt(record) : (record.learnt ?? false);
				return (
					<Flex gap="small" align="center" onClick={(e) => e.stopPropagation()}>
						{onToggleLearnt != null && (
							<Tooltip title={t('columnLearntTooltip')}>
								<Checkbox
									checked={learntChecked}
									onClick={(e) => e.stopPropagation()}
									onChange={(e) => {
										e.stopPropagation();
										onToggleLearnt(record, e.target.checked);
									}}
									aria-label={learntChecked ? 'Mark as will learn' : 'Mark as learnt'}
								/>
							</Tooltip>
						)}
						{/* <Button
							type="text"
							icon={<CommentOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								onCommentClick(record);
							}}
						/> */}
					</Flex>
				);
			},
		},
	];
}
