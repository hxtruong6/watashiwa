'use client';

import { getHiraganaBasic, getKatakanaBasic } from '@/modules/kana-reference/data/kanaData';
import { Flex, Tabs, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { KanaTable } from './KanaTable';

const { useToken } = theme;

type KanaTab = 'hiragana' | 'katakana';

export function KanaReferencePage() {
	const { token } = useToken();
	const t = useTranslations('KanaReference');
	const [activeTab, setActiveTab] = useState<KanaTab>('hiragana');

	const hiraganaGrid = useMemo(() => getHiraganaBasic(), []);
	const katakanaGrid = useMemo(() => getKatakanaBasic(), []);

	const tabItems = [
		{
			key: 'hiragana' as const,
			label: t('hiragana'),
			children: <KanaTable grid={hiraganaGrid} script="hiragana" />,
		},
		{
			key: 'katakana' as const,
			label: t('katakana'),
			children: <KanaTable grid={katakanaGrid} script="katakana" />,
		},
	];

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

			<Tabs
				activeKey={activeTab}
				onChange={(key) => setActiveTab(key as KanaTab)}
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
