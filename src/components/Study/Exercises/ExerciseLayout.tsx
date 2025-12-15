'use client';

import React from 'react';
import { Layout, Button, theme } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import ImmersiveProgressBar from '@/components/Study/ImmersiveProgressBar';

const { Content } = Layout;
const { useToken } = theme;

interface ExerciseLayoutProps {
	children: React.ReactNode;
	progress: number; // 0 to 100
	onExit: () => void;
}

export default function ExerciseLayout({ children, progress, onExit }: ExerciseLayoutProps) {
	const { token } = useToken();

	return (
		<Layout style={{ minHeight: '100vh', background: token.colorBgBase }}>
			{/* Progress Bar (Fixed Top) */}
			<ImmersiveProgressBar percent={progress} />

			{/* Exit Button (Fixed Top Right) */}
			<div
				style={{
					position: 'fixed',
					top: 16,
					right: 16,
					zIndex: 101, // Above progress bar
				}}
			>
				<Button
					type="text"
					shape="circle"
					icon={<CloseOutlined style={{ fontSize: 20, color: token.colorTextSecondary }} />}
					onClick={onExit}
					size="large"
					style={{
						background: 'rgba(0,0,0,0.05)',
						backdropFilter: 'none',
						border: 'none',
					}}
				/>
			</div>

			{/* Main Content Area */}
			<Content
				style={{
					padding: '24px',
					paddingTop: '64px', // Space for header/progress
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
					maxWidth: 600,
					margin: '0 auto',
					width: '100%',
					position: 'relative',
				}}
			>
				{children}
			</Content>
		</Layout>
	);
}
