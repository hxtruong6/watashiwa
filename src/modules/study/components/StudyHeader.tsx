'use client';
import { CommentOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Layout, Progress, Typography, theme } from 'antd';
import React from 'react';

const { Header } = Layout;
const { Text } = Typography;

interface StudyHeaderProps {
	visible: boolean;
	progressPercent: number;
	dueCount: number;
	commentCount: number;
	courseId?: string | null;
	deckId?: string | null;
	settingsRef: React.RefObject<HTMLButtonElement | null>;
	onOpenSettings: () => void;
	onOpenComments: () => void;
}

export default function StudyHeader({
	visible,
	progressPercent,
	onOpenSettings,
	onOpenComments,
}: StudyHeaderProps) {
	const { token } = theme.useToken();

	if (!visible) return null;

	return (
		<Header
			style={{
				background: token.colorBgContainer,
				display: 'flex',
				alignItems: 'center',
				padding: '0 16px',
				justifyContent: 'space-between',
				boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
				zIndex: 100,
			}}
		>
			<div style={{ flex: 1, marginRight: 16 }}>
				<Progress percent={progressPercent} showInfo={false} size="small" />
			</div>

			<div style={{ display: 'flex', gap: 8 }}>
				<Button icon={<CommentOutlined />} onClick={onOpenComments} />
				<Button icon={<SettingOutlined />} onClick={onOpenSettings} />
			</div>
		</Header>
	);
}
