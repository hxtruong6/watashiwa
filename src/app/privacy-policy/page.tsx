import { Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations('Legal.privacyPolicy');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/privacy-policy`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/privacy-policy',
			languages: {
				en: 'https://watashiwa.app/en/privacy-policy',
				vi: 'https://watashiwa.app/vi/privacy-policy',
			},
		},
	};
}

export default async function PrivacyPolicyPage() {
	const t = await getTranslations('Legal.privacyPolicy');
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
						<li>{t('section2.item5')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section3.title')}</Title>
					<Paragraph>{t('section3.content')}</Paragraph>
					<ul>
						<li>{t('section3.item1')}</li>
						<li>{t('section3.item2')}</li>
						<li>{t('section3.item3')}</li>
						<li>{t('section3.item4')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section4.title')}</Title>
					<Paragraph>{t('section4.content')}</Paragraph>
					<Paragraph>
						<strong>{t('section4.subtitle1')}</strong>
					</Paragraph>
					<ul>
						<li>{t('section4.item1')}</li>
						<li>{t('section4.item2')}</li>
						<li>{t('section4.item3')}</li>
					</ul>
					<Paragraph>
						<strong>{t('section4.subtitle2')}</strong>
					</Paragraph>
					<ul>
						<li>{t('section4.item4')}</li>
						<li>{t('section4.item5')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section5.title')}</Title>
					<Paragraph>{t('section5.content')}</Paragraph>
					<ul>
						<li>
							<strong>{t('section5.item1Title')}</strong>: {t('section5.item1Desc')}
						</li>
						<li>
							<strong>{t('section5.item2Title')}</strong>: {t('section5.item2Desc')}
						</li>
						<li>
							<strong>{t('section5.item3Title')}</strong>: {t('section5.item3Desc')}
						</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section6.title')}</Title>
					<Paragraph>{t('section6.content')}</Paragraph>
					<ul>
						<li>{t('section6.item1')}</li>
						<li>{t('section6.item2')}</li>
						<li>{t('section6.item3')}</li>
						<li>{t('section6.item4')}</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section7.title')}</Title>
					<Paragraph>{t('section7.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section8.title')}</Title>
					<Paragraph>{t('section8.content')}</Paragraph>
					<Paragraph>
						{t('section8.contact')}:{' '}
						<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
					</Paragraph>
				</section>
			</Space>
		</Flex>
	);
}
