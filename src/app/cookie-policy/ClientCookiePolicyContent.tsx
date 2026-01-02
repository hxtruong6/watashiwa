'use client';

import { Flex, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';

export default function ClientCookiePolicyContent() {
	const t = useTranslations('Legal.cookiePolicy');

	return (
		<>
			<Typography.Title level={1}>{t('title')}</Typography.Title>
			<Typography.Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
				{t('lastUpdated')}: {t('lastUpdatedDate')}
			</Typography.Text>

			<Space orientation="vertical" size="large" style={{ width: '100%' }}>
				<section>
					<Typography.Title level={2}>{t('section1.title')}</Typography.Title>
					<Typography.Paragraph>{t('section1.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section2.title')}</Typography.Title>
					<Typography.Paragraph>{t('section2.content')}</Typography.Paragraph>
					<Typography.Paragraph>
						<strong>{t('section2.subtitle1')}</strong>
					</Typography.Paragraph>
					<Typography.Paragraph>{t('section2.desc1')}</Typography.Paragraph>
					<Typography.Paragraph>
						<strong>{t('section2.subtitle2')}</strong>
					</Typography.Paragraph>
					<Typography.Paragraph>{t('section2.desc2')}</Typography.Paragraph>
					<Typography.Paragraph>
						<strong>{t('section2.subtitle3')}</strong>
					</Typography.Paragraph>
					<Typography.Paragraph>{t('section2.desc3')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section3.title')}</Typography.Title>
					<Typography.Paragraph>{t('section3.content')}</Typography.Paragraph>
					<ul>
						<li>{t('section3.item1')}</li>
						<li>{t('section3.item2')}</li>
						<li>{t('section3.item3')}</li>
					</ul>
				</section>

				<section>
					<Typography.Title level={2}>{t('section4.title')}</Typography.Title>
					<Typography.Paragraph>{t('section4.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section5.title')}</Typography.Title>
					<Typography.Paragraph>{t('section5.content')}</Typography.Paragraph>
					<ul>
						<li>{t('section5.item1')}</li>
						<li>{t('section5.item2')}</li>
						<li>{t('section5.item3')}</li>
						<li>{t('section5.item4')}</li>
					</ul>
				</section>
			</Space>
		</>
	);
}
