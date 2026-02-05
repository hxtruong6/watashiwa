'use client';

import { SoundOutlined } from '@ant-design/icons';
import { Button, Flex, Popover, Typography, theme } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { type SingleExample, getMeaningForExample } from '../data/exampleWords';

const { useToken } = theme;

export interface ExampleWordPopoverProps {
	/** When false, renders only children (no popover). */
	enabled: boolean;
	/** Script-specific example (one for Hiragana tab, one for Katakana tab). */
	example: SingleExample | undefined;
	/** Same play function as page (useKanaAudio) so voice/speed match user settings. */
	onPlayWord: (text: string) => void;
	children: ReactNode;
}

/**
 * Wraps a cell in a popover that shows one example word for the current script.
 * We always provide two examples per syllable (Hiragana + Katakana); this shows the one for the active tab.
 */
export function ExampleWordPopover({
	enabled,
	example,
	onPlayWord,
	children,
}: ExampleWordPopoverProps) {
	const { token } = useToken();
	const t = useTranslations('KanaReference');
	const locale = useLocale();

	if (!enabled) {
		return <>{children}</>;
	}

	const meaning = getMeaningForExample(example, locale);

	const content = example ? (
		<Flex vertical gap={token.marginSM} style={{ minWidth: 160 }}>
			<Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
				{example.word}
			</Typography.Text>
			<Typography.Text type="secondary" style={{ fontStyle: 'italic' }}>
				{example.romaji}
			</Typography.Text>
			{meaning ? <Typography.Text>{meaning}</Typography.Text> : null}
			<Button
				type="text"
				size="small"
				icon={<SoundOutlined />}
				onClick={() => onPlayWord(example.word)}
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
