'use client';

import { AdvancedSettings } from '@/modules/study/components/Settings/AdvancedSettings';
import { KeyboardShortcuts } from '@/modules/study/components/Settings/KeyboardShortcuts';
import { QuickSettingsBar } from '@/modules/study/components/Settings/QuickSettingsBar';
import type { User } from '@prisma/client';
import { Card, Flex, theme } from 'antd';

const { useToken } = theme;

interface StudySettingsProps {
	userSettings: Partial<User> | null;
	onSettingsChange: () => void;
}

export default function StudySettings({ userSettings, onSettingsChange }: StudySettingsProps) {
	const { token } = useToken();

	return (
		<Card
			size="small"
			style={{
				width: '100%',
				maxWidth: 600,
				margin: '0 auto 16px',
				borderRadius: 12,
				boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
			}}
		>
			<Flex vertical gap="middle">
				<QuickSettingsBar />

				<div style={{ marginTop: 12, marginBottom: 16 }}>
					<KeyboardShortcuts />
				</div>

				<AdvancedSettings userSettings={userSettings} onSettingsChange={onSettingsChange} />
			</Flex>
		</Card>
	);
}
