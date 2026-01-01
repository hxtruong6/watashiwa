import { QuestionCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { Flex, Space } from 'antd';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 3600;

const { Title, Paragraph, Text } = Typography;

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('Help');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/help`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/help',
			languages: {
				en: 'https://watashiwa.app/en/help',
				vi: 'https://watashiwa.app/vi/help',
				ja: 'https://watashiwa.app/ja/help',
			},
		},
	};
}

export default async function HelpPage() {
	const t = await getTranslations('Help');

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
			<Flex gap={16} align="center" style={{ marginBottom: 8 }}>
				<QuestionCircleOutlined style={{ fontSize: 32 }} />
				<Title level={1} style={{ margin: 0 }}>
					{t('title')}
				</Title>
			</Flex>
			<Paragraph style={{ fontSize: 18 }}>{t('subtitle')}</Paragraph>

			<Space orientation="vertical" size="large" style={{ width: '100%' }}>
				<section>
					<Title level={2}>{t('gettingStarted.title')}</Title>
					<Space orientation="vertical" size="middle" style={{ width: '100%' }}>
						<div>
							<Text strong>{t('gettingStarted.q1.question')}</Text>
							<Paragraph>{t('gettingStarted.q1.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('gettingStarted.q2.question')}</Text>
							<Paragraph>{t('gettingStarted.q2.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('gettingStarted.q3.question')}</Text>
							<Paragraph>{t('gettingStarted.q3.answer')}</Paragraph>
						</div>
					</Space>
				</section>

				<section>
					<Title level={2}>{t('flashcards.title')}</Title>
					<Space orientation="vertical" size="middle" style={{ width: '100%' }}>
						<div>
							<Text strong>{t('flashcards.q1.question')}</Text>
							<Paragraph>{t('flashcards.q1.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('flashcards.q2.question')}</Text>
							<Paragraph>{t('flashcards.q2.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('flashcards.q3.question')}</Text>
							<Paragraph>{t('flashcards.q3.answer')}</Paragraph>
						</div>
					</Space>
				</section>

				<section>
					<Title level={2}>{t('account.title')}</Title>
					<Space orientation="vertical" size="middle" style={{ width: '100%' }}>
						<div>
							<Text strong>{t('account.q1.question')}</Text>
							<Paragraph>{t('account.q1.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('account.q2.question')}</Text>
							<Paragraph>{t('account.q2.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('account.q3.question')}</Text>
							<Paragraph>{t('account.q3.answer')}</Paragraph>
						</div>
					</Space>
				</section>

				<section>
					<Title level={2}>{t('troubleshooting.title')}</Title>
					<Space orientation="vertical" size="middle" style={{ width: '100%' }}>
						<div>
							<Text strong>{t('troubleshooting.q1.question')}</Text>
							<Paragraph>{t('troubleshooting.q1.answer')}</Paragraph>
						</div>
						<div>
							<Text strong>{t('troubleshooting.q2.question')}</Text>
							<Paragraph>{t('troubleshooting.q2.answer')}</Paragraph>
						</div>
					</Space>
				</section>

				<section>
					<Title level={2}>{t('needMoreHelp.title')}</Title>
					<Paragraph>
						{t('needMoreHelp.content')} <Link href="/contact">{t('needMoreHelp.contactLink')}</Link>
						.
					</Paragraph>
				</section>
			</Space>
		</Flex>
	);
}
