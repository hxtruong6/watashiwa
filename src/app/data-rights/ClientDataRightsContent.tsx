'use client';

import { Button, Flex, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ClientDataRightsContent() {
	const t = useTranslations('Legal.dataRights');

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
					<ul>
						<li>
							<strong>{t('section1.item1Title')}</strong>: {t('section1.item1Desc')}
						</li>
						<li>
							<strong>{t('section1.item2Title')}</strong>: {t('section1.item2Desc')}
						</li>
						<li>
							<strong>{t('section1.item3Title')}</strong>: {t('section1.item3Desc')}
						</li>
						<li>
							<strong>{t('section1.item4Title')}</strong>: {t('section1.item4Desc')}
						</li>
						<li>
							<strong>{t('section1.item5Title')}</strong>: {t('section1.item5Desc')}
						</li>
						<li>
							<strong>{t('section1.item6Title')}</strong>: {t('section1.item6Desc')}
						</li>
					</ul>
				</section>

				<section>
					<Typography.Title level={2}>{t('section2.title')}</Typography.Title>
					<Typography.Paragraph>{t('section2.content')}</Typography.Paragraph>
					<Typography.Paragraph>
						{t('section2.email')}: <a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section3.title')}</Typography.Title>
					<Typography.Paragraph>{t('section3.content')}</Typography.Paragraph>
					<Typography.Paragraph>{t('section3.content2')}</Typography.Paragraph>
					<Link href="/dashboard?tab=settings">
						<Button type="primary" style={{ marginTop: 16 }}>
							{t('section3.button')}
						</Button>
					</Link>
				</section>

				<section>
					<Typography.Title level={2}>{t('section4.title')}</Typography.Title>
					<Typography.Paragraph>{t('section4.content')}</Typography.Paragraph>
					<ol>
						<li>{t('section4.step1')}</li>
						<li>{t('section4.step2')}</li>
						<li>{t('section4.step3')}</li>
					</ol>
					<Typography.Paragraph>
						<Typography.Text type="warning">{t('section4.warning')}</Typography.Text>
					</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section5.title')}</Typography.Title>
					<Typography.Paragraph>{t('section5.content')}</Typography.Paragraph>
					<Typography.Paragraph>
						{t('section5.contact')}:{' '}
						<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Typography.Paragraph>
				</section>
			</Space>
		</>
	);
}
