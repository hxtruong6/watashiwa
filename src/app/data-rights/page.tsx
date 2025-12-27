import { Button, Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 3600;

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('Legal.dataRights');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/data-rights`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/data-rights',
			languages: {
				en: 'https://watashiwa.app/en/data-rights',
				vi: 'https://watashiwa.app/vi/data-rights',
			},
		},
	};
}

export default async function DataRightsPage() {
	const t = await getTranslations('Legal.dataRights');

	return (
		<Flex
			vertical
			style={{
				maxWidth: 900,
				margin: '0 auto',
				padding: '48px 24px',
				minHeight: 'calc(100vh - 200px)',
			}}
		>
			<Title level={1}>{t('title')}</Title>
			<Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
				{t('lastUpdated')}: {t('lastUpdatedDate')}
			</Text>

			<Space orientation="vertical" size="large" style={{ width: '100%' }}>
				<section>
					<Title level={2}>{t('section1.title')}</Title>
					<Paragraph>{t('section1.content')}</Paragraph>
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
					<Title level={2}>{t('section2.title')}</Title>
					<Paragraph>{t('section2.content')}</Paragraph>
					<Paragraph>
						{t('section2.email')}: <a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section3.title')}</Title>
					<Paragraph>{t('section3.content')}</Paragraph>
					<Paragraph>{t('section3.content2')}</Paragraph>
					<Link href="/dashboard?tab=settings">
						<Button type="primary" style={{ marginTop: 16 }}>
							{t('section3.button')}
						</Button>
					</Link>
				</section>

				<section>
					<Title level={2}>{t('section4.title')}</Title>
					<Paragraph>{t('section4.content')}</Paragraph>
					<ol>
						<li>{t('section4.step1')}</li>
						<li>{t('section4.step2')}</li>
						<li>{t('section4.step3')}</li>
					</ol>
					<Paragraph>
						<Text type="warning">{t('section4.warning')}</Text>
					</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section5.title')}</Title>
					<Paragraph>{t('section5.content')}</Paragraph>
					<Paragraph>
						{t('section5.contact')}:{' '}
						<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Paragraph>
				</section>
			</Space>
		</Flex>
	);
}
