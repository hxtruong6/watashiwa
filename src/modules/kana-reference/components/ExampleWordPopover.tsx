'use client';

import { SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Popover, Typography, theme } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { type KanaExampleWord, getExampleWordDisplay } from '../data/exampleWords';
import type { KanaScript } from '../types';

const { useToken } = theme;

export interface ExampleWordPopoverProps {
	/** When false, renders only children (no popover). */
	enabled: boolean;
	example: KanaExampleWord | undefined;
	/** Current table script – used to show word vs wordKatakana. */
	script: KanaScript;
	/** Same play function as page (useKanaAudio) so voice/speed match user settings. */
	onPlayWord: (text: string) => void;
	children: ReactNode;
}

/**
 * Wraps a cell (or any trigger) in a popover that shows one example word.
 * When enabled, click on children opens the popover; same click is used by parent for copy/audio.
 */
export function ExampleWordPopover({
	enabled,
	example,
	script,
	onPlayWord,
	children,
}: ExampleWordPopoverProps) {
	const { token } = useToken();
	const t = useTranslations('KanaReference');
	const locale = useLocale();

	if (!enabled) {
		return <>{children}</>;
	}

	const meaning = example
		? locale === 'vi' && example.meaningVi
			? example.meaningVi
			: example.meaningEn
		: null;

	const displayWord = getExampleWordDisplay(example, script);

	const content = example ? (
		<Flex vertical gap={token.marginSM} style={{ minWidth: 160 }}>
			<Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
				{displayWord}
			</Typography.Text>
			<Typography.Text type="secondary" style={{ fontStyle: 'italic' }}>
				{example.romaji}
			</Typography.Text>
			<Typography.Text>{meaning}</Typography.Text>
			<Button
				type="text"
				size="small"
				icon={<SoundOutlined />}
				onClick={() => onPlayWord(displayWord)}
				style={{ alignSelf: 'flex-start' }}
			>
				{t('play')}
			</Button>
		</Flex>
	) : (
		<Typography.Text type="secondary">—</Typography.Text>
	);

	return (
		<Popover content={content} title={t('example')} trigger="click">
			<span style={{ display: 'inline-block' }}>{children}</span>
		</Popover>
	);
}
