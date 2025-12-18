import ImmersiveProgressBar from '@/components/Study/ImmersiveProgressBar';
import { CloseOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, theme } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';

const { useToken } = theme;

interface StudyHeaderProps {
	visible: boolean;
	progressPercent: number;
	dueCount: number;
	commentCount: number;
	courseId?: string | null;
	deckId?: string | null;
	settingsRef?: React.RefObject<HTMLButtonElement | null>;
	onOpenSettings: () => void;
	onOpenComments: () => void;
}

export default function StudyHeader({
	visible,
	progressPercent,
	dueCount,
	commentCount,
	courseId,
	deckId,
	settingsRef,
	onOpenSettings,
	onOpenComments,
}: StudyHeaderProps) {
	const { token } = useToken();
	const router = useRouter();
	const t = useTranslations('Study');

	const headerStyle: React.CSSProperties = {
		position: 'fixed',
		zIndex: 100,
		transition: 'opacity 0.3s ease, transform 0.3s ease',
		opacity: visible ? 1 : 0,
		transform: visible ? 'translateY(0)' : 'translateY(-20px)',
		pointerEvents: visible ? 'auto' : 'none',
	};

	const handleClose = () => {
		if (courseId) {
			router.push(`/courses/${courseId}`);
		} else if (deckId && !deckId.includes(',')) {
			router.push(`/decks/${deckId}`);
		} else {
			router.push('/');
		}
	};

	return (
		<>
			{/* Minimal Top Progress Bar */}
			<ImmersiveProgressBar percent={progressPercent} />

			{/* Top Right Controls (Close Only) */}
			<div style={{ ...headerStyle, top: 16, right: 16 }}>
				<Button
					shape="circle"
					icon={<CloseOutlined />}
					onClick={handleClose}
					onMouseDown={(e) => e.preventDefault()}
					style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
				/>
			</div>

			{/* Top Left Controls (Settings + Community + Counter) */}
			<div style={{ ...headerStyle, top: 16, left: 16 }}>
				<Flex gap="small" align="center">
					<Button
						ref={settingsRef as React.RefObject<HTMLButtonElement>}
						shape="circle"
						icon={<SettingOutlined />}
						onClick={onOpenSettings}
						onMouseDown={(e) => e.preventDefault()}
						style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: 44, height: 44 }}
					/>

					{/* Community Component */}
					<Badge count={commentCount} size="small" color="blue" offset={[-5, 5]}>
						<Button
							shape="circle"
							icon={<TeamOutlined />}
							onClick={onOpenComments}
							onMouseDown={(e) => e.preventDefault()}
							style={{
								border: 'none',
								background: 'rgba(0,0,0,0.05)',
								width: 44,
								height: 44,
								color: token.colorPrimary,
							}}
						/>
					</Badge>

					{/* Cards Left Counter */}
					<div
						style={{
							background: 'rgba(0,0,0,0.05)',
							padding: '4px 12px',
							borderRadius: 20,
							fontSize: 14,
							fontWeight: 600,
							color: token.colorTextSecondary,
						}}
					>
						{dueCount > 0 ? `${dueCount} ${t('left')}` : t('wait')}
					</div>
				</Flex>
			</div>
		</>
	);
}
