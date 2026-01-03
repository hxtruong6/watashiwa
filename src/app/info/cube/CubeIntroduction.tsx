'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Flex, Space, Typography, theme } from 'antd';
import { message } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

export default function CubeIntroduction() {
	const { token } = useToken();
	const t = useTranslations('Profile');
	const router = useRouter();
	const [selectingCube, setSelectingCube] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [cameFromSetup, setCameFromSetup] = useState(false);

	// Check authentication status and referrer
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const supabase = createClient();
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();
				setIsAuthenticated(!error && !!user);
			} catch {
				setIsAuthenticated(false);
			}
		};

		// Check if user came from profile setup
		if (typeof window !== 'undefined') {
			const referrer = document.referrer;
			setCameFromSetup(referrer.includes('/profile/setup'));
		}

		checkAuth();
	}, []);

	const handleSelectCube = async () => {
		if (!isAuthenticated) {
			router.push('/login?returnUrl=/info/cube');
			return;
		}

		setSelectingCube(true);
		try {
			const result = await updateUserSettings({
				preferences: {
					algorithmMode: 'semantic',
				},
			});

			if (result.success) {
				message.success(t('cubeMethodSelected') || 'CUBE method selected!');
				// Navigate based on where user came from
				if (cameFromSetup) {
					router.push('/profile/setup');
				} else {
					router.push('/dashboard');
				}
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

	const handleBack = () => {
		if (isAuthenticated && cameFromSetup) {
			router.push('/profile/setup');
		} else {
			router.push('/');
		}
	};

	// Determine if dark theme based on background color
	const isDarkTheme =
		token.colorBgContainer?.includes('15') || token.colorBgContainer?.includes('0B');

	// Theme-aware box shadow
	const cardShadow =
		token.boxShadow ||
		(isDarkTheme
			? '0 6px 16px 0 rgba(0, 0, 0, 0.12), 0 3px 6px -4px rgba(0, 0, 0, 0.18), 0 9px 28px 8px rgba(0, 0, 0, 0.15)'
			: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)');

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
					boxShadow: cardShadow,
					border: `1px solid ${token.colorBorder}`,
				}}
			>
				{/* Header with back button */}
				<Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
					<Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text">
						{isAuthenticated && cameFromSetup
							? t('backToSetup') || 'Back to Setup'
							: t('backToHome') || 'Back to Home'}
					</Button>
				</Flex>

				{/* Title */}
				<div style={{ textAlign: 'center', marginBottom: 48 }}>
					<Title level={1} style={{ color: token.colorPrimary, marginBottom: 16 }}>
						{t('cubeMethodTitle') || 'The CUBE Method'}
					</Title>
					<Text type="secondary" style={{ fontSize: 16, color: token.colorTextSecondary }}>
						{t('cubeMethodSubtitle') || 'Our innovative approach to Japanese vocabulary learning'}
					</Text>
				</div>

				{/* Introduction */}
				<Paragraph
					style={{
						fontSize: 16,
						lineHeight: 1.8,
						marginBottom: 32,
						color: token.colorText,
					}}
				>
					{t('cubeMethodIntroduction') ||
						"CUBE (Context, Understanding, Blocking, Encoding) is WatashiWa's revolutionary learning method that goes beyond traditional spaced repetition. Instead of treating words as isolated items, CUBE creates meaningful connections between related vocabulary, helping you build a deeper understanding of Japanese."}
				</Paragraph>

				<Divider style={{ borderColor: token.colorBorderSecondary }} />

				{/* Core Principles */}
				<Title level={3} style={{ marginBottom: 24, color: token.colorText }}>
					{t('cubeMethodPrinciples') || 'Core Principles'}
				</Title>

				<Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 32 }}>
					<Card
						style={{
							background: token.colorBgElevated || token.colorBgContainer,
							border: `1px solid ${token.colorBorder}`,
						}}
					>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8, color: token.colorText }}>
									{t('cubeContext') || 'Context'}
								</Title>
								<Text style={{ color: token.colorTextSecondary }}>
									{t('cubeContextDesc') ||
										'Words are presented with related vocabulary and contextual examples. Learn words in meaningful groups rather than random order.'}
								</Text>
							</div>
						</Flex>
					</Card>

					<Card
						style={{
							background: token.colorBgElevated || token.colorBgContainer,
							border: `1px solid ${token.colorBorder}`,
						}}
					>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8, color: token.colorText }}>
									{t('cubeUnderstanding') || 'Understanding'}
								</Title>
								<Text style={{ color: token.colorTextSecondary }}>
									{t('cubeUnderstandingDesc') ||
										'Deep etymology and Hán Việt connections help you understand the "why" behind words, not just memorize them.'}
								</Text>
							</div>
						</Flex>
					</Card>

					<Card
						style={{
							background: token.colorBgElevated || token.colorBgContainer,
							border: `1px solid ${token.colorBorder}`,
						}}
					>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8, color: token.colorText }}>
									{t('cubeBlocking') || 'Blocking'}
								</Title>
								<Text style={{ color: token.colorTextSecondary }}>
									{t('cubeBlockingDesc') ||
										'Our Confusion Shield proactively identifies and prevents mix-ups between similar words, homonyms, and pitch patterns.'}
								</Text>
							</div>
						</Flex>
					</Card>

					<Card
						style={{
							background: token.colorBgElevated || token.colorBgContainer,
							border: `1px solid ${token.colorBorder}`,
						}}
					>
						<Flex gap={16} align="flex-start">
							<CheckCircleOutlined
								style={{ fontSize: 24, color: token.colorPrimary, marginTop: 4 }}
							/>
							<div>
								<Title level={4} style={{ marginBottom: 8, color: token.colorText }}>
									{t('cubeEncoding') || 'Encoding'}
								</Title>
								<Text style={{ color: token.colorTextSecondary }}>
									{t('cubeEncodingDesc') ||
										'Dynamic practice variants adapt to your learning stage, ensuring words stick through active recall and varied contexts.'}
								</Text>
							</div>
						</Flex>
					</Card>
				</Space>

				<Divider style={{ borderColor: token.colorBorderSecondary }} />

				{/* Benefits */}
				<Title level={3} style={{ marginBottom: 24, color: token.colorText }}>
					{t('cubeMethodBenefits') || 'Why Choose CUBE?'}
				</Title>

				<Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 32 }}>
					<Text style={{ color: token.colorText }}>
						<strong>•</strong>{' '}
						{t('cubeBenefit1') || 'Faster vocabulary acquisition through semantic connections'}
					</Text>
					<Text style={{ color: token.colorText }}>
						<strong>•</strong>{' '}
						{t('cubeBenefit2') || 'Deeper understanding of word relationships and etymology'}
					</Text>
					<Text style={{ color: token.colorText }}>
						<strong>•</strong>{' '}
						{t('cubeBenefit3') || 'Reduced confusion between similar words and homonyms'}
					</Text>
					<Text style={{ color: token.colorText }}>
						<strong>•</strong>{' '}
						{t('cubeBenefit4') ||
							'More natural learning flow that mirrors how language is actually used'}
					</Text>
				</Space>

				<Divider style={{ borderColor: token.colorBorderSecondary }} />

				{/* CTA */}
				<Flex justify="center" gap={16} style={{ marginTop: 32 }}>
					<Button type="default" size="large" onClick={handleBack}>
						{isAuthenticated && cameFromSetup
							? t('backToSetup') || 'Back to Setup'
							: t('backToHome') || 'Back to Home'}
					</Button>
					{isAuthenticated ? (
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
					) : (
						<Button
							type="primary"
							size="large"
							onClick={() => router.push('/login?returnUrl=/info/cube')}
							style={{
								height: 48,
								fontWeight: 'bold',
								fontSize: 16,
							}}
						>
							{t('signUpToUseCube') || 'Sign Up to Use CUBE'}
						</Button>
					)}
				</Flex>
			</Card>
		</Flex>
	);
}
