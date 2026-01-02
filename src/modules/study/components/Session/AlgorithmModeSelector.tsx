'use client';

import { trackEvent } from '@/lib/analytics';
import { type AlgorithmMode, useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { updateAlgorithmModePreference } from '@/modules/study/study.actions';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Segmented, Spin, Tooltip, Typography, theme } from 'antd';
import { message } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface AlgorithmModeSelectorProps {
	onModeChange?: (mode: AlgorithmMode) => void;
}

/**
 * Algorithm Mode Selector Component
 * Allows users to switch between Semantic and SRS algorithm modes
 * Handles offline mode: saves locally immediately, syncs to server when online
 */
export function AlgorithmModeSelector({ onModeChange }: AlgorithmModeSelectorProps) {
	const t = useTranslations('Study');
	const { token } = useToken();
	const { algorithmMode, setAlgorithmMode } = useStudyPreferences();
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncError, setSyncError] = useState<string | null>(null);

	const handleModeChange = async (value: string) => {
		const newMode = value as AlgorithmMode;

		// Update local state immediately (works offline)
		setAlgorithmMode(newMode);
		setSyncError(null);

		// Track analytics
		trackEvent('algorithm_mode_switched', {
			from_mode: algorithmMode,
			to_mode: newMode,
			switch_reason: 'user_preference',
		});

		// Show confirmation message
		const modeLabel = newMode === 'semantic' ? t('algorithmModeSemantic') : t('algorithmModeSRS');
		message.success(t('algorithmModeSwitched', { mode: modeLabel }));

		// Sync to server with retry logic (non-blocking, works offline)
		setIsSyncing(true);
		let retryCount = 0;
		const maxRetries = 3;
		const retryDelay = 1000; // 1 second base delay

		while (retryCount < maxRetries) {
			try {
				const result = await updateAlgorithmModePreference({ algorithmMode: newMode });
				if (result.success) {
					setSyncError(null);
					break;
				} else {
					// Retry on failure
					if (retryCount < maxRetries - 1) {
						await new Promise((resolve) => setTimeout(resolve, retryDelay * (retryCount + 1)));
						retryCount++;
						continue;
					} else {
						setSyncError(result.error || 'Failed to sync preference');
						// Don't show error to user - preference is saved locally and will sync later
					}
				}
			} catch (error) {
				// Retry on exception
				if (retryCount < maxRetries - 1) {
					await new Promise((resolve) => setTimeout(resolve, retryDelay * (retryCount + 1)));
					retryCount++;
					continue;
				} else {
					setSyncError(error instanceof Error ? error.message : 'Unknown error');
					// Preference is saved locally, will sync when online
				}
			}
		}

		setIsSyncing(false);

		// Call optional callback
		onModeChange?.(newMode);
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
				<Text strong>{t('algorithmMode')}</Text>
				<Tooltip
					title={
						<div style={{ maxWidth: 300 }}>
							<Text strong>{t('algorithmModeSemantic')}:</Text> {t('algorithmModeTooltipSemantic')}
							<br />
							<br />
							<Text strong>{t('algorithmModeSRS')}:</Text> {t('algorithmModeTooltipSRS')}
						</div>
					}
				>
					<InfoCircleOutlined
						style={{ color: token.colorTextSecondary, cursor: 'help' }}
						aria-label={t('algorithmMode')}
					/>
				</Tooltip>
			</div>
			<div style={{ position: 'relative' }}>
				<Segmented
					options={[
						{ label: t('algorithmModeSemantic'), value: 'semantic' },
						{ label: t('algorithmModeSRS'), value: 'srs' },
					]}
					value={algorithmMode}
					onChange={handleModeChange}
					size="large"
					disabled={isSyncing}
					aria-label={t('algorithmMode')}
				/>
				{isSyncing && (
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							pointerEvents: 'none',
						}}
					>
						<Spin size="small" />
					</div>
				)}
			</div>
		</div>
	);
}
