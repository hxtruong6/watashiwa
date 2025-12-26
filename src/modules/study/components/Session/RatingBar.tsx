import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import { CheckCircleOutlined, RotateLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Grid, theme } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useRef, useState } from 'react';

const { useToken } = theme;
const { useBreakpoint } = Grid;

interface RatingBarProps {
	onRate: (action: 'forgot' | 'remember' | 'easy', duration?: number) => void;
	disabled?: boolean;
	selectedRating?: number | null;
	reactionTime?: number; // Current reaction time for time mapping
}

export default function RatingBar({
	onRate,
	disabled,
	selectedRating,
	reactionTime = 0,
}: RatingBarProps) {
	const t = useTranslations('Study');
	const { token } = useToken();
	const screens = useBreakpoint();
	const { showRatingText } = useStudyPreferences();

	// Long-press state
	const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
	const [isLongPressing, setIsLongPressing] = useState(false);
	const [longPressProgress, setLongPressProgress] = useState(0);
	const longPressStartTimeRef = useRef<number | null>(null);
	const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
	// Refs for cleanup (avoid dependency issues)
	const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
	const progressIntervalRefForCleanup = useRef<NodeJS.Timeout | null>(null);

	// Colors for buttons
	const forgotColor = { primary: token.colorError, bg: '#FFF1F0' };
	const rememberColor = { primary: token.colorSuccess, bg: '#F6FFED' };

	// Haptic feedback function
	const triggerHaptic = () => {
		if ('vibrate' in navigator) {
			navigator.vibrate(10); // Subtle 10ms vibration
		}
	};

	const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
		e.stopPropagation();
	};

	// Long-press handlers for Remember button
	const handleRememberPress = (e: React.MouseEvent | React.TouchEvent) => {
		e.stopPropagation();
		if (disabled) return;

		longPressStartTimeRef.current = performance.now();
		setLongPressProgress(0);

		// Visual feedback: Update progress every 50ms
		progressIntervalRef.current = setInterval(() => {
			if (longPressStartTimeRef.current) {
				const elapsed = performance.now() - longPressStartTimeRef.current;
				const progress = Math.min((elapsed / 500) * 100, 100); // 500ms = 100%
				setLongPressProgress(progress);
			}
		}, 50);

		const timer = setTimeout(() => {
			setIsLongPressing(true);
			triggerHaptic();
			// Explicit Easy override - bypass time mapping
			onRate('easy', reactionTime);
			// Cleanup
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current);
				progressIntervalRef.current = null;
			}
			setLongPressProgress(0);
		}, 500);

		setLongPressTimer(timer);
	};

	const handleRememberRelease = (e: React.MouseEvent | React.TouchEvent) => {
		e.stopPropagation();

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			setLongPressTimer(null);
		}

		if (progressIntervalRef.current) {
			clearInterval(progressIntervalRef.current);
			progressIntervalRef.current = null;
		}

		// Only trigger rating on actual mouseUp/touchEnd, not on mouseLeave
		// Check if this is a mouseUp/touchEnd event (not mouseLeave)
		const isActualRelease = e.type === 'mouseup' || e.type === 'touchend';

		if (isActualRelease && !isLongPressing) {
			// Normal tap - use time-based mapping
			triggerHaptic();
			onRate('remember', reactionTime);
		}

		setIsLongPressing(false);
		setLongPressProgress(0);
		longPressStartTimeRef.current = null;
	};

	// Separate handler for mouseLeave - only cancels long-press, doesn't trigger rating
	const handleRememberLeave = (e: React.MouseEvent) => {
		e.stopPropagation();

		// Cancel long-press timer if active
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			setLongPressTimer(null);
		}

		if (progressIntervalRef.current) {
			clearInterval(progressIntervalRef.current);
			progressIntervalRef.current = null;
		}

		// Reset state but DON'T trigger rating
		setIsLongPressing(false);
		setLongPressProgress(0);
		longPressStartTimeRef.current = null;
	};

	// Cancel long-press if user drags away
	const handleRememberMove = () => {
		if (longPressTimer && !isLongPressing) {
			// Cancel long-press if user moves while pressing
			clearTimeout(longPressTimer);
			setLongPressTimer(null);
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current);
				progressIntervalRef.current = null;
			}
			setLongPressProgress(0);
		}
	};

	// Sync refs with state for cleanup
	React.useEffect(() => {
		longPressTimerRef.current = longPressTimer;
		progressIntervalRefForCleanup.current = progressIntervalRef.current;
	}, [longPressTimer]);

	// Cleanup on unmount
	React.useEffect(() => {
		return () => {
			if (longPressTimerRef.current) {
				clearTimeout(longPressTimerRef.current);
			}
			if (progressIntervalRefForCleanup.current) {
				clearInterval(progressIntervalRefForCleanup.current);
			}
		};
	}, []); // Empty deps - cleanup only on unmount

	const getButtonStyle = (
		type: 'forgot' | 'remember',
		colorTheme: { primary: string; bg: string },
	) => {
		const isRemember = type === 'remember';
		const isActive = selectedRating !== null;

		let background = token.colorBgContainer;
		let color = colorTheme.primary;
		let border = `1px solid ${colorTheme.primary}`;
		let boxShadow = 'none';
		let transform = 'scale(1)';

		if (isRemember) {
			// Remember button: Filled Green (60% width)
			background = colorTheme.primary;
			color = '#fff';
			border = 'none';
			if (isLongPressing) {
				transform = 'scale(0.95)';
			} else if (isActive) {
				boxShadow = `0 0 0 4px ${colorTheme.primary}40`;
				transform = 'scale(1.02)';
			}
		} else {
			// Forgot button: Bordered Red (40% width)
			if (isActive) {
				background = colorTheme.primary;
				color = '#fff';
				boxShadow = `0 0 0 4px ${colorTheme.primary}40`;
				transform = 'scale(1.02)';
			} else {
				background = token.colorBgContainer;
				color = colorTheme.primary;
				border = `1px solid ${colorTheme.primary}`;
			}
		}

		return {
			height: screens.xs ? 48 : 56,
			fontSize: screens.xs ? 20 : 24,
			fontWeight: 600,
			transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			transform,
			width: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative' as const,
			backgroundColor: background,
			color: color,
			border: border,
			boxShadow: boxShadow,
			opacity: disabled && !isActive ? 0.5 : 1,
			userSelect: 'none' as const,
			WebkitUserSelect: 'none' as const,
			WebkitTouchCallout: 'none' as const,
		};
	};

	return (
		<div
			style={{
				marginTop: 16,
				padding: screens.xs ? '8px' : '12px',
				background: token.colorBgContainer,
				borderRadius: 16,
				boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
				backdropFilter: 'blur(12px)',
				width: '100%',
				maxWidth: 600,
			}}
			onClick={handleInteraction}
			onTouchStart={handleInteraction}
		>
			<div
				style={{
					display: 'grid',
					// 2 columns: Forgot (40%) and Remember (60%)
					gridTemplateColumns: '1fr 2fr',
					gap: 12,
				}}
			>
				{/* Forgot Button */}
				<Button
					size="large"
					loading={selectedRating === 1}
					onClick={() => {
						triggerHaptic();
						onRate('forgot', reactionTime);
					}}
					disabled={disabled && selectedRating !== 1}
					style={getButtonStyle('forgot', forgotColor)}
					icon={<RotateLeftOutlined />}
					aria-label={t('rateAgain')}
				>
					{showRatingText && t('rateAgain')}
				</Button>

				{/* Remember Button with Long-Press Support */}
				<Button
					size="large"
					loading={selectedRating === 3 || selectedRating === 4}
					onMouseDown={handleRememberPress}
					onMouseUp={handleRememberRelease}
					onMouseLeave={handleRememberLeave}
					onMouseMove={handleRememberMove}
					onTouchStart={handleRememberPress}
					onTouchEnd={handleRememberRelease}
					onTouchMove={handleRememberMove}
					disabled={disabled && selectedRating !== 3 && selectedRating !== 4}
					style={getButtonStyle('remember', rememberColor)}
					icon={<CheckCircleOutlined />}
					aria-label={t('rateRemember')}
				>
					{showRatingText && t('rateRemember')}
					{/* Long-press progress indicator */}
					{longPressProgress > 0 && longPressProgress < 100 && (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								background: `linear-gradient(90deg, rgba(255,255,255,0.3) ${longPressProgress}%, transparent ${longPressProgress}%)`,
								borderRadius: 'inherit',
								pointerEvents: 'none',
							}}
						/>
					)}
					{isLongPressing && (
						<ThunderboltOutlined
							style={{
								position: 'absolute',
								right: 8,
								fontSize: 16,
								opacity: 0.8,
							}}
						/>
					)}
				</Button>
			</div>
		</div>
	);
}
