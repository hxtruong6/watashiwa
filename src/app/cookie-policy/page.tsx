import { Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';
export const revalidate = 3600;

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('Legal.cookiePolicy');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/cookie-policy`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/cookie-policy',
			languages: {
				en: 'https://watashiwa.app/en/cookie-policy',
				vi: 'https://watashiwa.app/vi/cookie-policy',
			},
		},
	};
}

export default async function CookiePolicyPage() {
	const t = await getTranslations('Legal.cookiePolicy');

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
				</section>

				<section>
					<Title level={2}>{t('section2.title')}</Title>
					<Paragraph>{t('section2.content')}</Paragraph>
					<Paragraph>
						<strong>{t('section2.subtitle1')}</strong>
					</Paragraph>
					<Paragraph>{t('section2.desc1')}</Paragraph>
					<Paragraph>
						<strong>{t('section2.subtitle2')}</strong>
					</Paragraph>
					<Paragraph>{t('section2.desc2')}</Paragraph>
					<Paragraph>
						<strong>{t('section2.subtitle3')}</strong>
					</Paragraph>
					<Paragraph>{t('section2.desc3')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section3.title')}</Title>
					<Paragraph>{t('section3.content')}</Paragraph>
					<ul>
						<li>{t('section3.item1')}</li>
						<li>{t('section3.item2')}</li>
						<li>{t('section3.item3')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section4.title')}</Title>
					<Paragraph>{t('section4.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section5.title')}</Title>
					<Paragraph>{t('section5.content')}</Paragraph>
					<ul>
						<li>{t('section5.item1')}</li>
						<li>{t('section5.item2')}</li>
						<li>{t('section5.item3')}</li>
						<li>{t('section5.item4')}</li>
					</ul>
				</section>
			</Space>
		</Flex>
	);
}
