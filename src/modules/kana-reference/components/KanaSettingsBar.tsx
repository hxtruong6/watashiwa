'use client';

import { SettingOutlined } from '@ant-design/icons';
import { Flex, Switch, Tooltip, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';

import { useKanaPreferences } from '../hooks/useKanaPreferences';

const { useToken } = theme;

export function KanaSettingsBar() {
	const { token } = useToken();
	const t = useTranslations('KanaReference');
	const {
		showRomaji,
		playAudioOnTap,
		showExampleWords,
		setShowRomaji,
		setPlayAudioOnTap,
		setShowExampleWords,
	} = useKanaPreferences();

	return (
		<Flex
			align="center"
			gap={token.marginLG}
			wrap="wrap"
			style={{
				padding: token.paddingSM,
				backgroundColor: token.colorFillQuaternary,
				borderRadius: token.borderRadius,
				border: `1px solid ${token.colorBorderSecondary}`,
			}}
		>
			<Flex align="center" gap={token.marginXS} style={{ flexShrink: 0 }}>
				<SettingOutlined style={{ color: token.colorTextSecondary }} />
				<Tooltip title={t('settingsShowRomajiTooltip')}>
					<Flex align="center" gap={token.marginXS}>
						<Typography.Text type="secondary" style={{ fontWeight: 500 }}>
							{t('settingsShowRomaji')}
						</Typography.Text>
						<Switch checked={showRomaji} onChange={setShowRomaji} size="small" />
					</Flex>
				</Tooltip>
			</Flex>
			<Tooltip title={t('settingsPlayAudioOnTapTooltip')}>
				<Flex align="center" gap={token.marginXS} style={{ flexShrink: 0 }}>
					<Typography.Text type="secondary" style={{ fontWeight: 500 }}>
						{t('settingsPlayAudioOnTap')}
					</Typography.Text>
					<Switch checked={playAudioOnTap} onChange={setPlayAudioOnTap} size="small" />
				</Flex>
			</Tooltip>
			<Tooltip title={t('settingsShowExampleWordsTooltip')}>
				<Flex align="center" gap={token.marginXS} style={{ flexShrink: 0 }}>
					<Typography.Text type="secondary" style={{ fontWeight: 500 }}>
						{t('settingsShowExampleWords')}
					</Typography.Text>
					<Switch checked={showExampleWords} onChange={setShowExampleWords} size="small" />
				</Flex>
			</Tooltip>
		</Flex>
	);
}
