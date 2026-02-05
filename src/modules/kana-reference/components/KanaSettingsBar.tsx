'use client';

import { SettingOutlined } from '@ant-design/icons';
import { Flex, Switch, Tooltip, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';

import { useKanaPreferences } from '../hooks/useKanaPreferences';

const { useToken } = theme;

interface SettingSwitchProps {
	label: string;
	tooltip: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

function SettingSwitch({ label, tooltip, checked, onChange }: SettingSwitchProps) {
	const { token } = useToken();
	return (
		<Tooltip title={tooltip}>
			<Flex align="center" gap={token.marginXS} style={{ flexShrink: 0 }}>
				<Typography.Text type="secondary" style={{ fontWeight: 500 }}>
					{label}
				</Typography.Text>
				<Switch checked={checked} onChange={onChange} size="small" />
			</Flex>
		</Tooltip>
	);
}

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
				<SettingSwitch
					label={t('settingsShowRomaji')}
					tooltip={t('settingsShowRomajiTooltip')}
					checked={showRomaji}
					onChange={setShowRomaji}
				/>
			</Flex>
			<SettingSwitch
				label={t('settingsPlayAudioOnTap')}
				tooltip={t('settingsPlayAudioOnTapTooltip')}
				checked={playAudioOnTap}
				onChange={setPlayAudioOnTap}
			/>
			<SettingSwitch
				label={t('settingsShowExampleWords')}
				tooltip={t('settingsShowExampleWordsTooltip')}
				checked={showExampleWords}
				onChange={setShowExampleWords}
			/>
		</Flex>
	);
}
