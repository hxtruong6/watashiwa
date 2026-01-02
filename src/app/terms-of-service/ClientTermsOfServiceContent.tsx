'use client';

import { Flex, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';

export default function ClientTermsOfServiceContent() {
	const t = useTranslations('Legal.termsOfService');

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
					<ul>
						<li>{t('section2.item1')}</li>
						<li>{t('section2.item2')}</li>
						<li>{t('section2.item3')}</li>
						<li>{t('section2.item4')}</li>
					</ul>
				</section>

				<section>
					<Typography.Title level={2}>{t('section3.title')}</Typography.Title>
					<Typography.Paragraph>{t('section3.content')}</Typography.Paragraph>
					<Typography.Paragraph>{t('section3.content2')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section4.title')}</Typography.Title>
					<Typography.Paragraph>{t('section4.content')}</Typography.Paragraph>
					<Typography.Paragraph>{t('section4.content2')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section5.title')}</Typography.Title>
					<Typography.Paragraph>{t('section5.content')}</Typography.Paragraph>
					<ul>
						<li>{t('section5.item1')}</li>
						<li>{t('section5.item2')}</li>
						<li>{t('section5.item3')}</li>
						<li>{t('section5.item4')}</li>
						<li>{t('section5.item5')}</li>
					</ul>
				</section>

				<section>
					<Typography.Title level={2}>{t('section6.title')}</Typography.Title>
					<Typography.Paragraph>{t('section6.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section7.title')}</Typography.Title>
					<Typography.Paragraph>{t('section7.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section8.title')}</Typography.Title>
					<Typography.Paragraph>{t('section8.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section9.title')}</Typography.Title>
					<Typography.Paragraph>{t('section9.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section10.title')}</Typography.Title>
					<Typography.Paragraph>
						{t('section10.contact')}:{' '}
						<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Typography.Paragraph>
				</section>
			</Space>
		</>
	);
}
