'use client';

import { updateUserSettings } from '@/modules/user/user.actions';
import { setLocaleCookie } from '@/modules/user/utils/locale';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Flex,
	Form,
	Popover,
	Segmented,
	Select,
	Typography,
	message,
	theme,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const { Title, Text } = Typography;
const { useToken } = theme;

interface ProfileSetupFormProps {
	returnUrl?: string | null;
}

interface LearningMethodGuideProps {
	t: (key: string) => string;
	tStudy: (key: string) => string;
	tokenObj: ReturnType<typeof useToken>;
}

function LearningMethodGuide({ t, tStudy, tokenObj }: LearningMethodGuideProps) {
	const [open, setOpen] = useState(false);
	const token = tokenObj.token;

	const content = (
		<div
			style={{
				maxWidth: '100%',
				width: '100%',
				minWidth: 280,
			}}
		>
			<Flex vertical gap="small">
				<div>
					<Text
						strong
						style={{
							color: token.colorText,
							fontSize: 14,
							display: 'block',
							marginBottom: 4,
						}}
					>
						{tStudy('algorithmModeSemantic')} (CUBE):
					</Text>
					<Text
						style={{
							color: token.colorTextSecondary,
							fontSize: 13,
							lineHeight: 1.6,
							display: 'block',
						}}
					>
						{t('cubeMethodTooltip') ||
							'Our innovative method that groups related words together based on semantic connections, etymology, and context for deeper understanding.'}
					</Text>
				</div>
				<div
					style={{
						height: 1,
						background: token.colorBorderSecondary,
						margin: '8px 0',
					}}
				/>
				<div>
					<Text
						strong
						style={{
							color: token.colorText,
							fontSize: 14,
							display: 'block',
							marginBottom: 4,
						}}
					>
						{tStudy('algorithmModeSRS')}:
					</Text>
					<Text
						style={{
							color: token.colorTextSecondary,
							fontSize: 13,
							lineHeight: 1.6,
							display: 'block',
						}}
					>
						{t('srsMethodTooltip') ||
							'Traditional spaced repetition system that prioritizes due reviews and new cards based on optimal timing.'}
					</Text>
				</div>
			</Flex>
		</div>
	);

	// Determine if dark theme based on background color
	// Dark theme has darker backgrounds, so we check if colorBgContainer is dark
	const isDarkTheme =
		token.colorBgContainer?.includes('15') || token.colorBgContainer?.includes('0B');

	// Theme-aware box shadow: darker/more visible in dark theme, lighter in light theme
	const popoverShadow =
		token.boxShadow ||
		(isDarkTheme
			? '0 6px 16px 0 rgba(0, 0, 0, 0.12), 0 3px 6px -4px rgba(0, 0, 0, 0.18), 0 9px 28px 8px rgba(0, 0, 0, 0.15)'
			: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)');

	return (
		<Popover
			content={content}
			trigger={['click', 'hover']}
			open={open}
			onOpenChange={setOpen}
			placement="topRight"
			autoAdjustOverflow
			styles={{
				content: {
					maxWidth: 'min(400px, calc(100vw - 32px))',
					minWidth: 280,
					background: token.colorBgElevated || token.colorBgContainer,
					border: `1px solid ${token.colorBorder}`,
					boxShadow: popoverShadow,
					padding: '12px 16px',
				},
			}}
		>
			<Button
				type="text"
				icon={<InfoCircleOutlined />}
				size="small"
				style={{
					color: token.colorTextSecondary,
					cursor: 'help',
					padding: 0,
					width: 'auto',
					height: 'auto',
					minWidth: 'auto',
					touchAction: 'manipulation',
					userSelect: 'none',
					WebkitUserSelect: 'none',
					WebkitTouchCallout: 'none',
				}}
				aria-label={t('learningMethod') || 'Learning Method Information'}
			/>
		</Popover>
	);
}

export default function ProfileSetupForm({ returnUrl }: ProfileSetupFormProps) {
	const tokenObj = useToken();
	const token = tokenObj.token;
	const t = useTranslations('Profile');
	const tStudy = useTranslations('Study');
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const handleFinish = async (values: {
		language?: 'en' | 'vi';
		algorithmMode?: 'semantic' | 'srs';
	}) => {
		// Prevent multiple simultaneous submissions
		if (loading) {
			return;
		}

		setLoading(true);
		console.log('values', values);

		try {
			const result = await updateUserSettings({
				language: values.language || 'vi',
				preferences: {
					setupCompleted: true,
					algorithmMode: values.algorithmMode || 'srs', // Default to SRS
				},
			});

			if (result.success) {
				message.success(t('setupSuccess') || 'Profile setup complete!');

				// Set the locale cookie for next-intl to pick up the language change
				// This must be done before redirecting so the i18n system reads the correct locale
				const selectedLanguage = values.language || 'vi';
				setLocaleCookie(selectedLanguage);

				// Determine redirect path
				// Default to /dashboard for authenticated users (main board)
				const redirectPath = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard';

				// Use window.location.href for full page reload to ensure:
				// 1. Server components see updated setup status (cache invalidation)
				// 2. No race conditions with client-side state
				// 3. Consistent with auth flow patterns in codebase
				// 4. i18n system reads the updated NEXT_LOCALE cookie
				//
				// Note: router.push() could work, but window.location.href is safer
				// because it guarantees a fresh server-side render with updated DB state.
				// The slight performance trade-off is acceptable for correctness.
				window.location.href = redirectPath;
			} else {
				// Enhanced error handling with detailed logging
				console.error('Profile setup failed:', {
					error: result.error,
					validationErrors: result.validationErrors,
					userAgent: navigator.userAgent,
					isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
				});

				// Show user-friendly error message
				let errorMessage = t('setupError') || 'Failed to save profile. Please try again.';

				if (result.error === 'Unauthorized') {
					errorMessage =
						t('setupErrorAuth') ||
						'Your session has expired. Please refresh the page and try again.';
				} else if (result.error === 'Validation Failed') {
					errorMessage = t('setupErrorValidation') || 'Please check your input and try again.';
				} else if (result.error) {
					// Show the actual error message if available
					errorMessage = result.error;
				}

				message.error(errorMessage);
				setLoading(false);
			}
		} catch (error) {
			// Enhanced error logging for debugging
			console.error('Profile setup error:', {
				error,
				message: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				userAgent: navigator.userAgent,
				isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
			});

			const errorMessage = t('setupError') || 'Failed to save profile. Please try again.';
			message.error(errorMessage);
			setLoading(false);
		}
	};

	return (
		<Flex
			justify="center"
			align="center"
			style={{
				minHeight: 'calc(100vh - 64px)',
				padding: '24px 16px',
				background: token.colorBgLayout,
			}}
		>
			<Card
				style={{
					width: '100%',
					maxWidth: 500,
					background: token.colorBgContainer,
					boxShadow: token.boxShadow,
				}}
			>
				<div style={{ textAlign: 'center', marginBottom: 32 }}>
					<Title level={2} style={{ color: token.colorPrimary, marginBottom: 8 }}>
						{t('setupTitle') || 'Complete Your Profile'}
					</Title>
					<Text type="secondary" style={{ color: token.colorTextSecondary }}>
						{t('setupSubtitle') || 'Set up your preferences to get started'}
					</Text>
				</div>

				<Form
					form={form}
					layout="vertical"
					onFinish={handleFinish}
					initialValues={{ language: 'vi', algorithmMode: 'srs' }}
				>
					<Form.Item
						name="language"
						label={t('languageLabel') || 'Interface Language'}
						rules={[
							{ required: true, message: t('languageRequired') || 'Please select a language' },
						]}
						style={{ color: token.colorText }}
					>
						<Select
							options={[
								{ value: 'vi', label: '🇻🇳 Tiếng Việt' },
								{ value: 'en', label: '🇺🇸 English' },
							]}
							style={{ width: '100%' }}
						/>
					</Form.Item>

					<Form.Item
						name="algorithmMode"
						label={
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<Text style={{ color: token.colorText }}>
									{t('learningMethod') || 'Learning Method'}
								</Text>
								<LearningMethodGuide t={t} tStudy={tStudy} tokenObj={tokenObj} />
							</div>
						}
					>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<Segmented
								options={[
									{
										label: `${tStudy('algorithmModeSemantic')} (CUBE)`,
										value: 'semantic',
									},
									{ label: tStudy('algorithmModeSRS'), value: 'srs' },
								]}
								size="large"
								block
							/>
							<Button
								type="link"
								size="small"
								onClick={() => {
									// Open in new tab/window for PWA compatibility
									window.open('/info/cube', '_blank', 'noopener,noreferrer');
								}}
								style={{ padding: 0, height: 'auto', fontSize: 12, textAlign: 'left' }}
							>
								{t('learnMoreAboutCube') || 'Learn more about CUBE method →'}
							</Button>
						</div>
					</Form.Item>

					<Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
						<Button
							type="primary"
							htmlType="submit"
							block
							loading={loading}
							size="large"
							style={{
								height: 48,
								fontWeight: 'bold',
								fontSize: 16,
								touchAction: 'manipulation',
								userSelect: 'none',
								WebkitUserSelect: 'none',
								WebkitTouchCallout: 'none',
							}}
						>
							{t('completeSetup') || 'Complete Setup'}
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</Flex>
	);
}
