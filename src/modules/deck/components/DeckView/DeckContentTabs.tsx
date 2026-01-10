/**
 * DeckView - Content Tabs Component
 *
 * Tabs for switching between vocab and stories
 * Includes audio playback controls and settings
 */
import { LAYOUT } from '@/lib/constants';
import {
	AppstoreOutlined,
	BarsOutlined,
	EditOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
	PlayCircleOutlined,
	ReadOutlined,
	ReloadOutlined,
	StopOutlined,
} from '@ant-design/icons';
import { Button, Grid, Segmented, Space, Tabs, Tooltip, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import type { ContentType, ViewMode, VocabularyItem } from '../../types';
import { usePlayAllAudio } from './hooks/usePlayAllAudio';

const { Title } = Typography;
const { useToken } = theme;

interface DeckContentTabsProps {
	activeTab: ContentType;
	onTabChange: (key: ContentType) => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	showMeaning: boolean;
	onShowMeaningChange: (show: boolean) => void;
	repeatPlayback: boolean;
	onRepeatPlaybackChange: (repeat: boolean) => void;
	vocabCount: number;
	storiesCount: number;
	vocabularies: VocabularyItem[];
	vocabContent: ReactNode;
	storyContent: ReactNode;
	onCurrentPlayingWordChange?: (wordId: string | null) => void;
	stopPlayAll?: (stopFn: () => void) => void;
}

export function DeckContentTabs({
	activeTab,
	onTabChange,
	viewMode,
	onViewModeChange,
	showMeaning,
	onShowMeaningChange,
	repeatPlayback,
	onRepeatPlaybackChange,
	vocabCount,
	storiesCount,
	vocabularies,
	vocabContent,
	storyContent,
	onCurrentPlayingWordChange,
	stopPlayAll,
}: DeckContentTabsProps) {
	const t = useTranslations('Decks');
	const { token } = useToken();
	const screens = Grid.useBreakpoint();

	// Audio playback for vocabulary list
	const { isPlaying, toggle, stop, currentIndex, totalWords } = usePlayAllAudio({
		words: vocabularies,
		repeat: repeatPlayback,
		enabled: activeTab === 'vocab' && vocabularies.length > 0,
	});

	// Get current playing word ID
	const currentPlayingWordId =
		isPlaying && currentIndex >= 0 && currentIndex < vocabularies.length
			? vocabularies[currentIndex]?.id
			: null;

	// Notify parent of current playing word change
	useEffect(() => {
		if (onCurrentPlayingWordChange) {
			onCurrentPlayingWordChange(currentPlayingWordId);
		}
	}, [currentPlayingWordId, onCurrentPlayingWordChange]);

	// Expose stop function to parent
	useEffect(() => {
		if (stopPlayAll) {
			stopPlayAll(stop);
		}
	}, [stop, stopPlayAll]);

	// Stop playback when switching tabs
	useEffect(() => {
		if (activeTab !== 'vocab') {
			stop();
		}
	}, [activeTab, stop]);

	// Stop playback when component unmounts
	useEffect(() => {
		return () => {
			stop();
		};
	}, [stop]);

	const tabItems = [
		{
			key: 'vocab',
			label: (
				<span>
					<ReadOutlined /> {t('tabVocab', { count: vocabCount })}
				</span>
			),
			children: vocabContent,
		},
		{
			key: 'story',
			label: (
				<span>
					<EditOutlined /> Stories ({storiesCount})
				</span>
			),
			children: storyContent,
		},
	];

	const canPlay = activeTab === 'vocab' && vocabularies.length > 0;

	// Calculate sticky top position based on navbar height
	// Uses shared layout constants for consistency
	// xs = mobile (<576px), sm+ = tablet/desktop (≥576px)
	// This handles iPad and medium screens correctly
	const isMobile = screens.xs ?? false;
	const stickyTop = LAYOUT.getStickyTop(isMobile) - 5;

	return (
		<>
			<Title level={4} style={{ margin: 0, marginBottom: 16 }}>
				{t('deckContentsTitle')}
			</Title>
			<Space
				size="middle"
				wrap
				style={{
					position: 'sticky',
					top: stickyTop,
					zIndex: 100,
					backgroundColor: token.colorBgContainer,
					padding: '8px 12px',
					marginBottom: 16,
					borderRadius: 8,
					boxShadow: isPlaying ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
					transition: 'box-shadow 0.3s ease',
					border: `1px solid ${token.colorBorderSecondary}`,
					width: '100%',
					justifyContent: 'flex-end',
				}}
			>
				{canPlay && (
					<>
						{isPlaying && (
							<span
								style={{
									fontSize: 12,
									color: token.colorTextSecondary,
									fontWeight: 500,
								}}
							>
								{currentIndex + 1} / {totalWords}
							</span>
						)}
						<Tooltip title={isPlaying ? 'Stop playback' : 'Play all words'}>
							<Button
								type={isPlaying ? 'primary' : 'default'}
								danger={isPlaying}
								icon={isPlaying ? <StopOutlined /> : <PlayCircleOutlined />}
								onClick={toggle}
								size={isPlaying ? 'middle' : 'small'}
								style={{
									animation: isPlaying ? 'audioPulse 1.5s ease-in-out infinite' : 'none',
									fontWeight: isPlaying ? 600 : 'normal',
								}}
							>
								{isPlaying ? 'Stop' : ''}
							</Button>
						</Tooltip>
					</>
				)}
				<Tooltip title={showMeaning ? 'Hide meanings' : 'Show meanings'}>
					<Button
						type={showMeaning ? 'default' : 'text'}
						icon={showMeaning ? <EyeOutlined /> : <EyeInvisibleOutlined />}
						onClick={() => onShowMeaningChange(!showMeaning)}
						size="small"
						aria-label={showMeaning ? 'Hide meanings' : 'Show meanings'}
					/>
				</Tooltip>
				<Tooltip title={repeatPlayback ? 'Disable repeat' : 'Enable repeat playback'}>
					<Button
						type={repeatPlayback ? 'default' : 'text'}
						icon={<ReloadOutlined spin={repeatPlayback} />}
						onClick={() => onRepeatPlaybackChange(!repeatPlayback)}
						size="small"
						disabled={!canPlay}
						aria-label={repeatPlayback ? 'Disable repeat' : 'Enable repeat'}
					/>
				</Tooltip>
				<Segmented
					options={[
						{ value: 'Grid', icon: <AppstoreOutlined /> },
						{ value: 'List', icon: <BarsOutlined /> },
					]}
					value={viewMode}
					onChange={(val) => onViewModeChange(val as ViewMode)}
				/>
			</Space>
			<style>
				{`
					@keyframes audioPulse {
						0%, 100% {
							opacity: 1;
							transform: scale(1);
						}
						50% {
							opacity: 0.7;
							transform: scale(1.05);
						}
					}
				`}
			</style>

			<Tabs
				activeKey={activeTab}
				onChange={(key) => onTabChange(key as ContentType)}
				items={tabItems}
				type="card"
			/>
		</>
	);
}
