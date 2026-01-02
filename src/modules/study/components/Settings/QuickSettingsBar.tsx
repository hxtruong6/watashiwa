'use client';

import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { FontSizeOutlined, SoundOutlined, TranslationOutlined } from '@ant-design/icons';
import { Flex, Radio, Switch, Tooltip, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { useToken } = theme;

export function QuickSettingsBar() {
	const t = useTranslations('Settings');
	const tCommon = useTranslations('Common');
	const { token } = useToken();

	const {
		showFurigana,
		setShowFurigana,
		showRomaji,
		setShowRomaji,
		autoPlayAudio,
		setAutoPlayAudio,
		showRatingText,
		setShowRatingText,
	} = useStudyPreferences();

	return (
		<Flex
			gap="middle"
			wrap="wrap"
			justify="space-between"
			align="center"
			style={{ marginBottom: 16 }}
		>
			<Flex align="center" gap="small">
				<Tooltip title={t('showReadingsTooltip')}>
					<FontSizeOutlined style={{ color: token.colorPrimary }} />
				</Tooltip>
				<Text style={{ fontSize: 13 }}>{t('showReadings')}</Text>
				<Switch size="small" checked={showFurigana} onChange={setShowFurigana} />
			</Flex>

			<Flex align="center" gap="small">
				<Tooltip title={t('showRomajiTooltip')}>
					<TranslationOutlined style={{ color: token.colorSuccess }} />
				</Tooltip>
				<Text style={{ fontSize: 13 }}>{t('showRomaji')}</Text>
				<Switch size="small" checked={showRomaji} onChange={setShowRomaji} />
			</Flex>

			<Flex align="center" gap="small" wrap="wrap">
				<Tooltip title={t('playAudioTooltip')}>
					<SoundOutlined style={{ color: token.colorWarning }} />
				</Tooltip>
				<Text style={{ fontSize: 13 }}>{t('playAudio')}</Text>
				<Radio.Group
					value={autoPlayAudio}
					onChange={(e) => setAutoPlayAudio(e.target.value as 'off' | 'question' | 'answer')}
					size="small"
				>
					<Radio.Button value="off">{tCommon('off')}</Radio.Button>
					<Radio.Button value="question">{t('question')}</Radio.Button>
					<Radio.Button value="answer">{t('answer')}</Radio.Button>
				</Radio.Group>
			</Flex>

			<Flex align="center" gap="small">
				<Tooltip title={t('showLabelsTooltip')}>
					<TranslationOutlined style={{ color: token.colorPrimary }} />
				</Tooltip>
				<Text style={{ fontSize: 13 }}>{t('showLabels')}</Text>
				<Switch size="small" checked={showRatingText} onChange={setShowRatingText} />
			</Flex>
		</Flex>
	);
}
