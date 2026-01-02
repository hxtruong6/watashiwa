'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Flex, Space, Typography, theme } from 'antd';
import { message } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

export default function CubeIntroduction() {
	const { token } = useToken();
	const t = useTranslations('Profile');
	const router = useRouter();
	const [selectingCube, setSelectingCube] = useState(false);

	const handleSelectCube = async () => {
		setSelectingCube(true);
		try {
			const result = await updateUserSettings({
				preferences: {
					algorithmMode: 'semantic',
				},
			});

			if (result.success) {
				message.success(t('cubeMethodSelected') || 'CUBE method selected!');
				// Navigate back to profile setup
				router.push('/profile/setup');
			} else {
				message.error(result.error || t('setupError') || 'Failed to save preference');
			}
		} catch (error) {
			console.error('Error selecting CUBE method:', error);
			message.error(t('setupError') || 'Failed to save preference. Please try again.');
		} finally {
			setSelectingCube(false);
		}
	};

	return (
		<Flex
			justify="center"
			align="flex-start"
			style={{
				minHeight: 'calc(100vh - 64px)',
				padding: '24px 16px',
				background: token.colorBgLayout,
			}}
		>
			<Card
				style={{
					width: '100%',
					maxWidth: 800,
					background: token.colorBgContainer,
					boxShadow: token.boxShadow,
				}}
			>
				{/* Header with back button */}
				<Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => router.push('/profile/setup')}
						type="text"
					>
						{t('backToSetup') || 'Back to Setup'}
					</Button>
				</Flex>

				{/* Title */}
				<div style={{ textAlign: 'center', marginBottom: 48 }}>
					<Title level={1} style={{ color: token.colorPrimary, marginBottom: 16 }}>
						{t('cubeMethodTitle') || 'The CUBE Method'}
					</Title>
					<Text type="secondary" style={{ fontSize: 16 }}>
						{t('cubeMethodSubtitle') || 'Our innovative approach to Japanese vocabulary learning'}
					</Text>
				</div>

				{/* Introduction */}
				<Paragraph style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
					{t('cubeMethodIntroduction') ||
						"CUBE (Context, Understanding, Blocking, Encoding) is WatashiWa's revolutionary learning method that goes beyond traditional spaced repetition. Instead of treating words as isolated items, CUBE creates meaningful connections between related vocabulary, helping you build a deeper understanding of Japanese."}
				</Paragraph>

				<Divider />

				{/* Core Principles */}
				<Title level={3} style={{ marginBottom: 24 }}>
					{t('cubeMethodPrinciples') || 'Core Principles'}
				</Title>

				<Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 32 }}>
					<Card>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8 }}>
									{t('cubeContext') || 'Context'}
								</Title>
								<Text>
									{t('cubeContextDesc') ||
										'Words are presented with related vocabulary and contextual examples. Learn words in meaningful groups rather than random order.'}
								</Text>
							</div>
						</Flex>
					</Card>

					<Card>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8 }}>
									{t('cubeUnderstanding') || 'Understanding'}
								</Title>
								<Text>
									{t('cubeUnderstandingDesc') ||
										'Deep etymology and Hán Việt connections help you understand the "why" behind words, not just memorize them.'}
								</Text>
							</div>
						</Flex>
					</Card>

					<Card>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8 }}>
									{t('cubeBlocking') || 'Blocking'}
								</Title>
								<Text>
									{t('cubeBlockingDesc') ||
										'Our Confusion Shield proactively identifies and prevents mix-ups between similar words, homonyms, and pitch patterns.'}
								</Text>
							</div>
						</Flex>
					</Card>

					<Card>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8 }}>
									{t('cubeEncoding') || 'Encoding'}
								</Title>
								<Text>
									{t('cubeEncodingDesc') ||
										'Dynamic practice variants adapt to your learning stage, ensuring words stick through active recall and varied contexts.'}
								</Text>
							</div>
						</Flex>
					</Card>
				</Space>

				<Divider />

				{/* Benefits */}
				<Title level={3} style={{ marginBottom: 24 }}>
					{t('cubeMethodBenefits') || 'Why Choose CUBE?'}
				</Title>

				<Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 32 }}>
					<Text>
						<strong>•</strong>{' '}
						{t('cubeBenefit1') || 'Faster vocabulary acquisition through semantic connections'}
					</Text>
					<Text>
						<strong>•</strong>{' '}
						{t('cubeBenefit2') || 'Deeper understanding of word relationships and etymology'}
					</Text>
					<Text>
						<strong>•</strong>{' '}
						{t('cubeBenefit3') || 'Reduced confusion between similar words and homonyms'}
					</Text>
					<Text>
						<strong>•</strong>{' '}
						{t('cubeBenefit4') ||
							'More natural learning flow that mirrors how language is actually used'}
					</Text>
				</Space>

				<Divider />

				{/* CTA */}
				<Flex justify="center" gap={16} style={{ marginTop: 32 }}>
					<Button type="default" size="large" onClick={() => router.push('/profile/setup')}>
						{t('backToSetup') || 'Back to Setup'}
					</Button>
					<Button
						type="primary"
						size="large"
						loading={selectingCube}
						onClick={handleSelectCube}
						style={{
							height: 48,
							fontWeight: 'bold',
							fontSize: 16,
						}}
					>
						{t('selectCubeMethod') || 'Select CUBE Method'}
					</Button>
				</Flex>
			</Card>
		</Flex>
	);
}
