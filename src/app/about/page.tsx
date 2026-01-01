import { GithubOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations('About');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/about`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/about',
		},
	};
}

export default async function AboutPage() {
	const t = await getTranslations('About');
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
			<Paragraph style={{ fontSize: 18 }}>{t('subtitle')}</Paragraph>

			<Space orientation="vertical" size="large" style={{ width: '100%' }}>
				<section>
					<Title level={2}>{t('section1.title')}</Title>
					<Paragraph>{t('section1.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section2.title')}</Title>
					<Paragraph>{t('section2.content')}</Paragraph>
					<ul>
						<li>
							<strong>{t('section2.item1Title')}</strong>: {t('section2.item1Desc')}
						</li>
						<li>
							<strong>{t('section2.item2Title')}</strong>: {t('section2.item2Desc')}
						</li>
						<li>
							<strong>{t('section2.item3Title')}</strong>: {t('section2.item3Desc')}
						</li>
						<li>
							<strong>{t('section2.item4Title')}</strong>: {t('section2.item4Desc')}
						</li>
						<li>
							<strong>{t('section2.item5Title')}</strong>: {t('section2.item5Desc')}
						</li>
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section3.title')}</Title>
					<Paragraph>{t('section3.content')}</Paragraph>
					<Space wrap>
						<Text code>Next.js 16</Text>
						<Text code>TypeScript</Text>
						<Text code>PostgreSQL</Text>
						<Text code>Prisma</Text>
						<Text code>Supabase</Text>
						<Text code>Ant Design</Text>
						<Text code>ts-fsrs</Text>
					</Space>
				</section>

				<section>
					<Title level={2}>{t('section4.title')}</Title>
					<Paragraph>{t('section4.content')}</Paragraph>
					<a
						href="https://github.com/watashiwa/watashiwa"
						target="_blank"
						rel="noopener noreferrer"
						style={{ display: 'inline-block', marginTop: 16 }}
					>
						<Button type="primary" icon={<GithubOutlined />}>
							{t('section4.button')}
						</Button>
					</a>
				</section>

				<section>
					<Title level={2}>{t('section5.title')}</Title>
					<Paragraph>{t('section5.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section6.title')}</Title>
					<Paragraph>{t('section6.content')}</Paragraph>
					<ul>
						<li>{t('section6.item1')}</li>
						<li>{t('section6.item2')}</li>
						<li>{t('section6.item3')}</li>
					</ul>
				</section>
			</Space>
		</Flex>
	);
}
