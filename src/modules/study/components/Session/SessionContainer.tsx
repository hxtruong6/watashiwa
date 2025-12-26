'use client';

import themeConfig from '@/lib/theme/themeConfig';
import { CloseOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Progress, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

const { Content } = Layout;

interface SessionContainerProps {
	children: React.ReactNode;
	progress?: number; // 0-100
	onExit?: () => void;
	actions?: React.ReactNode;
	headerVisible?: boolean;
}

export const SessionContainer: React.FC<SessionContainerProps> = ({
	children,
	progress = 0,
	onExit,
	actions,
	headerVisible = true,
}) => {
	const router = useRouter();
	const { token } = theme.useToken();

	const handleExit = () => {
		if (onExit) {
			onExit();
		} else {
			router.back();
		}
	};

	return (
		<ConfigProvider theme={themeConfig}>
			<Layout
				style={{
					minHeight: '100vh',
					background: token.colorBgBase,
					overflow: 'hidden',
					position: 'relative',
				}}
			>
				{/* Zen Progress Bar (Top, 2px) */}
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						zIndex: 1000,
						pointerEvents: 'none',
						opacity: headerVisible ? 1 : 0,
						transition: 'opacity 0.3s ease',
					}}
				>
					<Progress
						percent={progress}
						showInfo={false}
						size="small"
						strokeColor={token.colorPrimary}
						railColor="transparent"
						style={{ lineHeight: 0, margin: 0, borderRadius: 0 }}
					/>
				</div>

				{/* Minimal Controls Layer */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						padding: '16px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						zIndex: 2000, // Higher than Tour component (which uses ~1000)
						pointerEvents: 'none',
						opacity: headerVisible ? 1 : 0,
						transition: 'opacity 0.3s ease',
					}}
				>
					{/* Back / Exit Button */}
					<div style={{ pointerEvents: 'auto' }}>
						<Button
							type="text"
							shape="circle"
							icon={<CloseOutlined style={{ fontSize: '20px', color: token.colorTextSecondary }} />}
							onClick={handleExit}
							aria-label="Exit Session"
							size="large"
							style={{
								backdropFilter: 'blur(4px)',
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
							}}
						/>
					</div>

					{/* Custom Actions (Settings, etc) */}
					{actions && (
						<div
							style={{
								pointerEvents: 'auto',
								display: 'flex',
								gap: 8,
							}}
						>
							{actions}
						</div>
					)}
				</div>

				{/* Main Content (The "Stage") */}
				<Content
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
						padding: '16px',
						paddingTop: '64px',
						height: '100vh',
						overflowY: 'auto',
					}}
				>
					{children}
				</Content>
			</Layout>
		</ConfigProvider>
	);
};
