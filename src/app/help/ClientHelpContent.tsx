'use client';

import { QuestionCircleOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { useTranslations } from 'next-intl';

export default function ClientHelpContent() {
	const t = useTranslations('Help');

	return (
		<>
			{/* Icon + Title (enhanced version of server-rendered header) */}
			<Flex gap={16} align="center" style={{ marginBottom: 8 }}>
				<QuestionCircleOutlined style={{ fontSize: 32 }} />
				<Typography.Title level={1} style={{ margin: 0 }}>
					{t('title')}
				</Typography.Title>
			</Flex>
			<Typography.Paragraph style={{ fontSize: 18 }}>{t('subtitle')}</Typography.Paragraph>

			<Flex vertical gap="large" style={{ width: '100%' }}>
				<section>
					<Typography.Title level={2}>{t('gettingStarted.title')}</Typography.Title>
					<Flex vertical gap="middle" style={{ width: '100%' }}>
						<div>
							<Typography.Text strong>{t('gettingStarted.q1.question')}</Typography.Text>
							<Typography.Paragraph>{t('gettingStarted.q1.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('gettingStarted.q2.question')}</Typography.Text>
							<Typography.Paragraph>{t('gettingStarted.q2.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('gettingStarted.q3.question')}</Typography.Text>
							<Typography.Paragraph>{t('gettingStarted.q3.answer')}</Typography.Paragraph>
						</div>
					</Flex>
				</section>

				<section>
					<Typography.Title level={2}>{t('flashcards.title')}</Typography.Title>
					<Flex vertical gap="middle" style={{ width: '100%' }}>
						<div>
							<Typography.Text strong>{t('flashcards.q1.question')}</Typography.Text>
							<Typography.Paragraph>{t('flashcards.q1.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('flashcards.q2.question')}</Typography.Text>
							<Typography.Paragraph>{t('flashcards.q2.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('flashcards.q3.question')}</Typography.Text>
							<Typography.Paragraph>{t('flashcards.q3.answer')}</Typography.Paragraph>
						</div>
					</Flex>
				</section>

				<section>
					<Typography.Title level={2}>{t('account.title')}</Typography.Title>
					<Flex vertical gap="middle" style={{ width: '100%' }}>
						<div>
							<Typography.Text strong>{t('account.q1.question')}</Typography.Text>
							<Typography.Paragraph>{t('account.q1.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('account.q2.question')}</Typography.Text>
							<Typography.Paragraph>{t('account.q2.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('account.q3.question')}</Typography.Text>
							<Typography.Paragraph>{t('account.q3.answer')}</Typography.Paragraph>
						</div>
					</Flex>
				</section>

				<section>
					<Typography.Title level={2}>{t('troubleshooting.title')}</Typography.Title>
					<Flex vertical gap="middle" style={{ width: '100%' }}>
						<div>
							<Typography.Text strong>{t('troubleshooting.q1.question')}</Typography.Text>
							<Typography.Paragraph>{t('troubleshooting.q1.answer')}</Typography.Paragraph>
						</div>
						<div>
							<Typography.Text strong>{t('troubleshooting.q2.question')}</Typography.Text>
							<Typography.Paragraph>{t('troubleshooting.q2.answer')}</Typography.Paragraph>
						</div>
					</Flex>
				</section>

				<section>
					<Typography.Title level={2}>{t('needMoreHelp.title')}</Typography.Title>
					<Typography.Paragraph>
						{t('needMoreHelp.content')}{' '}
						<a href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>
							{t('needMoreHelp.contactLink')}
						</a>
						.
					</Typography.Paragraph>
				</section>
			</Flex>
		</>
	);
}
