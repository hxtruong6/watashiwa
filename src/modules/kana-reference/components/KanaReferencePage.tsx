'use client';

import {
	getHiraganaBasic,
	getHiraganaDakuten,
	getKatakanaBasic,
	getKatakanaDakuten,
} from '@/modules/kana-reference/data/kanaData';
import { useKanaAudio } from '@/modules/kana-reference/hooks/useKanaAudio';
import { useKanaPreferences } from '@/modules/kana-reference/hooks/useKanaPreferences';
import { kanaParsers } from '@/modules/kana-reference/kana.params';
import { Flex, Segmented, Tabs, Typography, message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

import { KanaSettingsBar } from './KanaSettingsBar';
import { KanaTable } from './KanaTable';

const { useToken } = theme;

export function KanaReferencePage() {
	const { token } = useToken();
	const t = useTranslations('KanaReference');
	const { showRomaji, playAudioOnTap, showExampleWords } = useKanaPreferences();
	const { play: playAudio } = useKanaAudio({
		onPlayError: () => message.error(t('audioPlayFailed')),
	});

	const [table, setTable] = useQueryState(
		'table',
		kanaParsers.table.withOptions({ shallow: false }),
	);
	const [section, setSection] = useQueryState(
		'section',
		kanaParsers.section.withOptions({ shallow: false }),
	);

	const hiraganaBasic = useMemo(() => getHiraganaBasic(), []);
	const hiraganaDakuten = useMemo(() => getHiraganaDakuten(), []);
	const katakanaBasic = useMemo(() => getKatakanaBasic(), []);
	const katakanaDakuten = useMemo(() => getKatakanaDakuten(), []);

	const handleCellClick = useCallback(
		(_cellId: string, character: string, _romaji: string) => {
			if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
				message.error(t('copyNotSupported'));
				return;
			}
			navigator.clipboard
				.writeText(character)
				.then(() => {
					message.success(t('copiedChar', { char: character }));
				})
				.catch(() => {
					message.error(t('copyNotSupported'));
				});

			if (playAudioOnTap) {
				try {
					playAudio(character);
				} catch {
					message.error(t('audioPlayFailed'));
				}
			}
		},
		[t, playAudioOnTap, playAudio],
	);

	const tabItems = useMemo(
		() => [
			{
				key: 'hiragana' as const,
				label: t('hiragana'),
				children: (
					<KanaTable
						grid={section === 'dakuten' ? hiraganaDakuten : hiraganaBasic}
						script="hiragana"
						onCellClick={handleCellClick}
						showRomaji={showRomaji}
						showExampleWords={showExampleWords}
						onPlayWord={playAudio}
					/>
				),
			},
			{
				key: 'katakana' as const,
				label: t('katakana'),
				children: (
					<KanaTable
						grid={section === 'dakuten' ? katakanaDakuten : katakanaBasic}
						script="katakana"
						onCellClick={handleCellClick}
						showRomaji={showRomaji}
						showExampleWords={showExampleWords}
						onPlayWord={playAudio}
					/>
				),
			},
		],
		[
			section,
			hiraganaBasic,
			hiraganaDakuten,
			katakanaBasic,
			katakanaDakuten,
			t,
			handleCellClick,
			playAudio,
			showRomaji,
			showExampleWords,
		],
	);

	return (
		<Flex
			vertical
			gap={token.marginLG}
			style={{
				maxWidth: 900,
				margin: '0 auto',
				padding: token.paddingLG,
				minHeight: 'calc(100vh - 120px)',
			}}
		>
			<header>
				<Typography.Title level={1} style={{ margin: 0, marginBottom: token.marginXS }}>
					{t('title')}
				</Typography.Title>
				<Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: token.fontSize }}>
					{t('subtitle')}
				</Typography.Paragraph>
			</header>

			<KanaSettingsBar />

			<Segmented
				value={section}
				onChange={(value) => value && setSection(value as 'basic' | 'dakuten')}
				options={[
					{ label: t('sectionBasic'), value: 'basic' },
					{ label: t('sectionDakuten'), value: 'dakuten' },
				]}
				size="large"
				block
				style={{
					marginBottom: token.marginSM,
				}}
			/>

			<Tabs
				activeKey={table}
				onChange={(key) => key && setTable(key as 'hiragana' | 'katakana')}
				items={tabItems}
				size="large"
				style={{
					backgroundColor: token.colorBgContainer,
					padding: token.paddingMD,
					borderRadius: token.borderRadiusLG,
					border: `1px solid ${token.colorBorderSecondary}`,
				}}
			/>
		</Flex>
	);
}
