'use client';

import { GithubOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';

export default function ClientAboutContent() {
	const t = useTranslations('About');

	return (
		<Space orientation="vertical" size="large" style={{ width: '100%' }}>
			<section>
				<Typography.Title level={2}>{t('section1.title')}</Typography.Title>
				<Typography.Paragraph>{t('section1.content')}</Typography.Paragraph>
			</section>

			<section>
				<Typography.Title level={2}>{t('section2.title')}</Typography.Title>
				<Typography.Paragraph>{t('section2.content')}</Typography.Paragraph>
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
				<Typography.Title level={2}>{t('section3.title')}</Typography.Title>
				<Typography.Paragraph>{t('section3.content')}</Typography.Paragraph>
				<Space wrap>
					<Typography.Text code>Next.js 16</Typography.Text>
					<Typography.Text code>TypeScript</Typography.Text>
					<Typography.Text code>PostgreSQL</Typography.Text>
					<Typography.Text code>Prisma</Typography.Text>
					<Typography.Text code>Supabase</Typography.Text>
					<Typography.Text code>Ant Design</Typography.Text>
					<Typography.Text code>ts-fsrs</Typography.Text>
				</Space>
			</section>

			<section>
				<Typography.Title level={2}>{t('section4.title')}</Typography.Title>
				<Typography.Paragraph>{t('section4.content')}</Typography.Paragraph>
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
				<Typography.Title level={2}>{t('section5.title')}</Typography.Title>
				<Typography.Paragraph>{t('section5.content')}</Typography.Paragraph>
			</section>

			<section>
				<Typography.Title level={2}>{t('section6.title')}</Typography.Title>
				<Typography.Paragraph>{t('section6.content')}</Typography.Paragraph>
				<ul>
					<li>{t('section6.item1')}</li>
					<li>{t('section6.item2')}</li>
					<li>{t('section6.item3')}</li>
				</ul>
			</section>
		</Space>
	);
}
