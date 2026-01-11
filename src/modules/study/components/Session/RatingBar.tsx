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

	// Colors for buttons - using theme tokens for consistency
	// Remember: Primary action (uses app primary color - Indigo)
	// Forgot: Secondary/destructive action (uses error color)
	const rememberColor = {
		primary: token.colorPrimary, // Indigo (Ai-iro) - Primary brand color
		bg: token.colorBgContainer,
		hoverBg: token.colorPrimaryHover || token.colorPrimary,
	};
	// Create a lighter, softer version of error color for less aggressive appearance
	// Mixes error color with background to create a softer tint
	const getLighterErrorColor = () => {
		const errorHex = token.colorError.replace('#', '');
		const r = parseInt(errorHex.slice(0, 2), 16);
		const g = parseInt(errorHex.slice(2, 4), 16);
		const b = parseInt(errorHex.slice(4, 6), 16);

		// Get background color for mixing (works for both light and dark themes)
		const bgHex = token.colorBgContainer.replace('#', '');
		const bgR = parseInt(bgHex.slice(0, 2), 16);
		const bgG = parseInt(bgHex.slice(2, 4), 16);
		const bgB = parseInt(bgHex.slice(4, 6), 16);

		// Mix error color with background at 35% to create softer tint
		// This gives us 65% original error + 35% background = softer appearance
		const mixRatio = 0.35;
		const lightR = Math.round(r + (bgR - r) * mixRatio);
		const lightG = Math.round(g + (bgG - g) * mixRatio);
		const lightB = Math.round(b + (bgB - b) * mixRatio);
		return `rgb(${lightR}, ${lightG}, ${lightB})`;
	};

	const forgotColor = {
		primary: getLighterErrorColor(), // Softer tint of Vermilion - less aggressive, more subtle
		bg: token.colorBgContainer,
		hoverBg: token.colorErrorHover || token.colorError, // Full color on hover for clear feedback
	};

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
		colorTheme: { primary: string; bg: string; hoverBg?: string },
	) => {
		const isRemember = type === 'remember';
		const isActive = selectedRating !== null;

		// Base styles
		let background = token.colorBgContainer;
		let color = colorTheme.primary;
		let border = `1px solid ${colorTheme.primary}`;
		let boxShadow = 'none';
		let transform = 'scale(1)';
		let borderWidth = '1px';

		if (isRemember) {
			// Remember button: Primary action - Filled with primary color (60% width)
			// This is the main positive action, so it should be prominent
			background = colorTheme.primary;
			color = token.colorBgBase; // White/light text on primary background
			border = 'none';
			borderWidth = '0';

			if (isLongPressing) {
				// Long-press state: Slightly darker shade for feedback
				background = colorTheme.hoverBg || colorTheme.primary;
				transform = 'scale(0.95)';
				boxShadow = `0 0 0 2px ${colorTheme.primary}60`;
			} else if (isActive) {
				// Active state: Subtle glow effect
				boxShadow = `0 0 0 4px ${colorTheme.primary}40, 0 4px 12px ${colorTheme.primary}20`;
				transform = 'scale(1.02)';
			}
		} else {
			// Forgot button: Secondary/destructive action - Outlined style (40% width)
			// Less prominent than Remember, but still clear
			if (isActive) {
				// Active state: Filled with error color
				background = colorTheme.primary;
				color = token.colorBgBase; // White/light text on error background
				border = 'none';
				borderWidth = '0';
				boxShadow = `0 0 0 4px ${colorTheme.primary}40, 0 4px 12px ${colorTheme.primary}20`;
				transform = 'scale(1.02)';
			} else {
				// Default state: Outlined style
				background = token.colorBgContainer;
				color = colorTheme.primary;
				border = `1.5px solid ${colorTheme.primary}`;
				borderWidth = '1.5px';
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
			borderWidth: borderWidth,
			boxShadow: boxShadow,
			opacity: disabled && !isActive ? 0.5 : 1,
			userSelect: 'none' as const,
			WebkitUserSelect: 'none' as const,
			WebkitTouchCallout: 'none' as const,
			cursor: disabled && !isActive ? 'not-allowed' : 'pointer',
		};
	};

	return (
		<div
			style={{
				marginTop: 16,
				padding: screens.xs ? '8px' : '12px',
				background: token.colorBgContainer,
				borderRadius: token.borderRadiusLG || 16,
				// Use theme-aware shadow that works in both light and dark modes
				boxShadow: token.boxShadowSecondary || '0 8px 32px rgba(0,0,0,0.08)',
				backdropFilter: 'blur(12px)',
				width: '100%',
				maxWidth: 600,
				border: `1px solid ${token.colorBorderSecondary || token.colorBorder}`,
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
								// Use theme-aware overlay for better contrast
								background: `linear-gradient(90deg, rgba(255,255,255,0.4) ${longPressProgress}%, transparent ${longPressProgress}%)`,
								borderRadius: 'inherit',
								pointerEvents: 'none',
								zIndex: 1,
							}}
						/>
					)}
					{isLongPressing && (
						<ThunderboltOutlined
							style={{
								position: 'absolute',
								right: 8,
								fontSize: 18,
								color: token.colorBgBase, // White/light icon on primary background
								opacity: 0.9,
								zIndex: 2,
								transition: 'all 0.2s ease',
							}}
						/>
					)}
				</Button>
			</div>
		</div>
	);
}
