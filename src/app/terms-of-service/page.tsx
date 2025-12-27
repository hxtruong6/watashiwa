import { Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations('Legal.termsOfService');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/terms-of-service`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/terms-of-service',
			languages: {
				en: 'https://watashiwa.app/en/terms-of-service',
				vi: 'https://watashiwa.app/vi/terms-of-service',
			},
		},
	};
}

export default async function TermsOfServicePage() {
	const t = await getTranslations('Legal.termsOfService');
	const locale = await getLocale();

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
					<ul>
						<li>{t('section2.item1')}</li>
						<li>{t('section2.item2')}</li>
						<li>{t('section2.item3')}</li>
						<li>{t('section2.item4')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section3.title')}</Title>
					<Paragraph>{t('section3.content')}</Paragraph>
					<Paragraph>{t('section3.content2')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section4.title')}</Title>
					<Paragraph>{t('section4.content')}</Paragraph>
					<Paragraph>{t('section4.content2')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section5.title')}</Title>
					<Paragraph>{t('section5.content')}</Paragraph>
					<ul>
						<li>{t('section5.item1')}</li>
						<li>{t('section5.item2')}</li>
						<li>{t('section5.item3')}</li>
						<li>{t('section5.item4')}</li>
						<li>{t('section5.item5')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section6.title')}</Title>
					<Paragraph>{t('section6.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section7.title')}</Title>
					<Paragraph>{t('section7.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section8.title')}</Title>
					<Paragraph>{t('section8.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section9.title')}</Title>
					<Paragraph>{t('section9.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section10.title')}</Title>
					<Paragraph>
						{t('section10.contact')}:{' '}
						<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Paragraph>
				</section>
			</Space>
		</Flex>
	);
}
