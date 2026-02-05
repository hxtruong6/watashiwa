'use client';

import {
	getEmailVerificationStatus,
	requestEmailVerification,
	verifyEmailOTP,
} from '@/modules/email/email.actions';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	MailOutlined,
	ReloadOutlined,
} from '@ant-design/icons';
import { Button, Flex, Input, Modal, Space, Typography, message, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface EmailVerificationButtonProps {
	userEmail: string;
}

export default function EmailVerificationButton({ userEmail }: EmailVerificationButtonProps) {
	const { token } = useToken();
	const t = useTranslations('Email');
	const tCommon = useTranslations('Common');
	const [loading, setLoading] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [emailVerified, setEmailVerified] = useState(false);
	const [otpModalOpen, setOtpModalOpen] = useState(false);
	const [otp, setOtp] = useState('');
	const [checkingStatus, setCheckingStatus] = useState(true);

	// Check verification status on mount
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const result = await getEmailVerificationStatus();
				if (result.success && result.data) {
					// emailVerifiedAt is Date | null, convert to boolean
					setEmailVerified(!!result.data.emailVerifiedAt);
				} else if (result.error) {
					// Show error to user if status check fails
					message.error(result.error || 'Failed to check verification status');
				}
			} catch (error) {
				console.error('Error checking email verification status:', error);
				message.error('Failed to check verification status');
			} finally {
				setCheckingStatus(false);
			}
		};

		checkStatus();
	}, []);

	const handleRequestOTP = useCallback(async () => {
		setLoading(true);
		try {
			const result = await requestEmailVerification();
			if (result.success && result.data) {
				message.success(result.data.message);
				setOtpModalOpen(true);
			} else {
				message.error(result.error || 'Failed to send verification code');
			}
		} catch (error) {
			message.error(error instanceof Error ? error.message : 'Failed to send verification code');
		} finally {
			setLoading(false);
		}
	}, []);

	const handleVerifyOTP = useCallback(async () => {
		if (otp.length !== 6 || !/^\d+$/.test(otp)) {
			message.error('Please enter a valid 6-digit code');
			return;
		}

		setVerifying(true);
		try {
			const result = await verifyEmailOTP({ otp });
			if (result.success && result.data) {
				message.success(result.data.message);
				setEmailVerified(true);
				setOtpModalOpen(false);
				setOtp('');
			} else {
				message.error(result.error || 'Invalid verification code');
			}
		} catch (error) {
			message.error(error instanceof Error ? error.message : 'Invalid verification code');
		} finally {
			setVerifying(false);
		}
	}, [otp]);

	const handleOtpChange = useCallback((value: string) => {
		// Only allow numeric input, max 6 digits
		const numericValue = value.replace(/\D/g, '').slice(0, 6);
		setOtp(numericValue);
	}, []);

	const handleCloseModal = useCallback(() => {
		setOtpModalOpen(false);
		setOtp('');
	}, []);

	if (checkingStatus) {
		return (
			<Flex align="center" gap="small">
				<Text type="secondary">{t('checkingStatus')}</Text>
			</Flex>
		);
	}

	return (
		<>
			<Flex vertical gap="middle">
				<Flex justify="space-between" align="center">
					<Space>
						{emailVerified ? (
							<>
								<CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 16 }} />
								<Text strong style={{ color: token.colorSuccess }}>
									{t('emailVerified') || 'Email Verified'}
								</Text>
							</>
						) : (
							<>
								<CloseCircleOutlined style={{ color: token.colorError, fontSize: 16 }} />
								<Text type="warning">{t('emailNotVerified') || 'Email Not Verified'}</Text>
							</>
						)}
					</Space>
					{!emailVerified && (
						<Button
							type="primary"
							icon={<MailOutlined />}
							onClick={handleRequestOTP}
							loading={loading}
						>
							{t('verifyEmail') || 'Verify Email'}
						</Button>
					)}
				</Flex>
				{!emailVerified && (
					<Text type="secondary" style={{ fontSize: 12 }}>
						{t('verifyEmailDescription') ||
							'Verify your email to secure your account and receive important updates.'}
					</Text>
				)}
			</Flex>

			<Modal
				title={
					<Space>
						<MailOutlined />
						{t('verifyEmailModalTitle') || 'Verify Your Email'}
					</Space>
				}
				open={otpModalOpen}
				onCancel={handleCloseModal}
				footer={null}
				width={400}
			>
				<Flex vertical gap="large" style={{ padding: '20px 0' }}>
					<Text>{t('otpSentMessage') || 'We sent a 6-digit verification code to:'}</Text>
					<Text strong>{userEmail}</Text>

					<Flex vertical gap="small">
						<Text strong>{t('enterCode') || 'Enter Verification Code'}</Text>
						<Input
							value={otp}
							onChange={(e) => handleOtpChange(e.target.value)}
							placeholder="000000"
							maxLength={6}
							size="large"
							style={{
								fontSize: 24,
								letterSpacing: 8,
								textAlign: 'center',
								fontFamily: 'monospace',
							}}
							onPressEnter={handleVerifyOTP}
							autoFocus
						/>
						<Text type="secondary" style={{ fontSize: 12 }}>
							{t('otpExpiresIn') || 'Code expires in 15 minutes'}
						</Text>
					</Flex>

					<Flex gap="small">
						<Button
							type="primary"
							block
							onClick={handleVerifyOTP}
							loading={verifying}
							disabled={otp.length !== 6}
						>
							{tCommon('verify') || 'Verify'}
						</Button>
						<Button onClick={handleCloseModal}>{tCommon('cancel') || 'Cancel'}</Button>
					</Flex>

					<Flex justify="center">
						<Button
							type="link"
							icon={<ReloadOutlined />}
							onClick={handleRequestOTP}
							loading={loading}
							size="small"
						>
							{t('resendCode') || 'Resend Code'}
						</Button>
					</Flex>
				</Flex>
			</Modal>
		</>
	);
}
