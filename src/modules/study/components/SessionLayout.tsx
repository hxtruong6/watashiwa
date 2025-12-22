'use client';

import themeConfig from '@/lib/theme/themeConfig';
import { CloseOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Progress, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

const { Header, Content } = Layout;

interface SessionLayoutProps {
	children: React.ReactNode;
	progress?: number; // 0-100
	onExit?: () => void;
}

export const SessionLayout: React.FC<SessionLayoutProps> = ({ children, progress = 0, onExit }) => {
	const router = useRouter();
	const { token } = theme.useToken();

	const handleExit = () => {
		if (onExit) {
			onExit();
		} else {
			router.back(); // Default behavior
		}
	};

	return (
		<ConfigProvider theme={themeConfig}>
			<Layout
				style={{
					minHeight: '100vh',
					background: token.colorBgBase,
					overflow: 'hidden', // Prevent scroll in session
				}}
			>
				{/* Minimal Header */}
				<Header
					style={{
						background: 'transparent',
						padding: '0 16px',
						height: '64px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						zIndex: 100, // Stay above cards
					}}
				>
					{/* Progress Bar (Zen Style - Minimal) */}
					<div style={{ flex: 1, marginRight: '24px', maxWidth: '300px' }}>
						<Progress
							percent={progress}
							showInfo={false}
							size="small"
							strokeColor={token.colorSuccess}
							trailColor="rgba(0,0,0,0.05)"
						/>
					</div>

					{/* Exit Button */}
					<Button
						type="text"
						icon={<CloseOutlined style={{ fontSize: '20px', color: token.colorTextSecondary }} />}
						onClick={handleExit}
						aria-label="Exit Session"
					/>
				</Header>

				{/* Main Content (The "Stage") */}
				<Content
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
						padding: '16px',
					}}
				>
					{children}
				</Content>
			</Layout>
		</ConfigProvider>
	);
};
