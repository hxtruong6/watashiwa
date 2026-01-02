'use client';

import { GithubOutlined, MailOutlined } from '@ant-design/icons';
import { Flex, Space, Typography } from 'antd';
import { useTranslations } from 'next-intl';

export default function ClientContactContent() {
	const t = useTranslations('Contact');

	return (
		<>
			<Typography.Title level={1}>{t('title')}</Typography.Title>
			<Typography.Paragraph style={{ fontSize: 18 }}>{t('subtitle')}</Typography.Paragraph>

			<Space orientation="vertical" size="large" style={{ width: '100%' }}>
				<section>
					<Typography.Title level={2}>{t('section1.title')}</Typography.Title>
					<Space orientation="vertical" size="middle">
						<Flex gap={16} align="center">
							<MailOutlined style={{ fontSize: 24 }} />
							<div>
								<Typography.Text strong>{t('section1.emailLabel')}</Typography.Text>
								<br />
								<a href="mailto:support@watashiwa.app">support@watashiwa.app</a>
							</div>
						</Flex>
						<Flex gap={16} align="center">
							<GithubOutlined style={{ fontSize: 24 }} />
							<div>
								<Typography.Text strong>{t('section1.githubLabel')}</Typography.Text>
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
					</ul>
				</section>

				<section>
					<Typography.Title level={2}>{t('section3.title')}</Typography.Title>
					<Typography.Paragraph>{t('section3.content')}</Typography.Paragraph>
				</section>

				<section>
					<Typography.Title level={2}>{t('section4.title')}</Typography.Title>
					<Typography.Paragraph>{t('section4.content')}</Typography.Paragraph>
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
		</>
	);
}
