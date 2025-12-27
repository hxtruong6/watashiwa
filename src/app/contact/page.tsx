import { GithubOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations('Contact');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/contact`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/contact',
			languages: {
				en: 'https://watashiwa.app/en/contact',
				vi: 'https://watashiwa.app/vi/contact',
			},
		},
	};
}

export default async function ContactPage() {
	const t = await getTranslations('Contact');
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
					<Space orientation="vertical" size="middle">
						<Flex gap={16} align="center">
							<MailOutlined style={{ fontSize: 24 }} />
							<div>
								<Text strong>{t('section1.emailLabel')}</Text>
								<br />
								<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
							</div>
						</Flex>
						<Flex gap={16} align="center">
							<GithubOutlined style={{ fontSize: 24 }} />
							<div>
								<Text strong>{t('section1.githubLabel')}</Text>
								<br />
								<a
									href="https://github.com/watashiwa/watashiwa"
									target="_blank"
									rel="noopener noreferrer"
								>
									{t('section1.githubLink')}
								</a>
							</div>
						</Flex>
					</Space>
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
					</ul>
				</section>

				<section>
					<Title level={2}>{t('section3.title')}</Title>
					<Paragraph>{t('section3.content')}</Paragraph>
				</section>

				<section>
					<Title level={2}>{t('section4.title')}</Title>
					<Paragraph>{t('section4.content')}</Paragraph>
					<ul>
						<li>
							<a
								href="https://github.com/watashiwa/watashiwa/issues"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t('section4.item1')}
							</a>
						</li>
						<li>
							<a
								href="https://github.com/watashiwa/watashiwa/discussions"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t('section4.item2')}
							</a>
						</li>
					</ul>
				</section>
			</Space>
		</Flex>
	);
}
