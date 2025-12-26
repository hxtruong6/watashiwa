'use client';

import { Collapse, Typography, theme } from 'antd';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { useToken } = theme;

export function KeyboardShortcuts() {
	const t = useTranslations('Settings');
	const { token } = useToken();

	const guideItems = [
		{
			key: '1',
			label: (
				<Text strong style={{ fontSize: 12 }}>
					{t('guideTitle')}
				</Text>
			),
			style: { background: token.colorFillQuaternary, borderRadius: 8 },
			children: (
				<ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: token.colorTextSecondary }}>
					<li>
						<Text strong>[Space]</Text>: {t('guideSpace')}
					</li>
					<li>
						<Text strong>[1-4]</Text>: {t('guideNumbers')}
					</li>
					<li>
						<Text strong>[R]</Text>: {t('guideReplay')}
					</li>
					<li>
						<Text strong>[E]</Text>: {t('guideExample')}
					</li>
					<li>
						<Text strong>Mobile</Text>: {t('guideMobile')}
					</li>
				</ul>
			),
		},
	];

	return <Collapse ghost size="small" items={guideItems} />;
}

