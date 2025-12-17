import React from 'react';
import { Button, theme, Grid } from 'antd';
import { useTranslations } from 'next-intl';

const { useToken } = theme;
const { useBreakpoint } = Grid;

interface RatingBarProps {
	onRate: (rating: number) => void;
	disabled?: boolean;
	selectedRating?: number | null;
}

export default function RatingBar({ onRate, disabled, selectedRating }: RatingBarProps) {
	const t = useTranslations('Study');
	const { token } = useToken();
	const screens = useBreakpoint();

	// Map ratings to Theme Tokens
	// Design System:
	// Again (1): Bordered Red
	// Good (3): Filled Green (Dominant)
	// Easy (4): Bordered Indigo
	// Note: We skip 2 (Hard) to simplify decision making ("Zen Mode")
	const colors = {
		1: { primary: token.colorError, bg: '#FFF1F0' },
		3: { primary: token.colorSuccess, bg: '#F6FFED' },
		4: { primary: token.colorPrimary, bg: '#F0F5FF' },
	};

	const getButtonStyle = (rating: number, colorTheme: { primary: string; bg: string }) => {
		const isSelected = selectedRating === rating;
		const isGood = rating === 3; // The "Golden Path" action

		const isActive = isSelected;

		let background = token.colorBgContainer;
		let color = colorTheme.primary;
		let border = `1px solid ${colorTheme.primary}`;
		let boxShadow = 'none';

		if (isGood) {
			// Good is "Filled Green" per design system
			background = colorTheme.primary;
			color = '#fff';
			border = 'none';
			if (isActive) {
				boxShadow = `0 0 0 4px ${colorTheme.primary}40`; // Focus ring
			}
		} else {
			// Others are Bordered
			if (isActive) {
				background = colorTheme.primary;
				color = '#fff';
				boxShadow = `0 0 0 4px ${colorTheme.primary}40`;
			} else {
				background = token.colorBgContainer; // or transparent
				color = colorTheme.primary;
				border = `1px solid ${colorTheme.primary}`;
			}
		}

		return {
			height: screens.xs ? 48 : 56, // Increased mobile height slightly for better hit area
			fontSize: screens.xs ? 15 : 16,
			fontWeight: 600,
			transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			transform: isActive ? 'scale(1.02)' : 'scale(1)',

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

	const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
		e.stopPropagation();
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
				maxWidth: 600, // Allow wider on desktop
			}}
			onClick={handleInteraction}
			onTouchStart={handleInteraction}
		>
			<div
				style={{
					display: 'grid',
					// 3 columns for Zen simplicity
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: 12, // Increased gap slightly since we have more space
				}}
			>
				<Button
					size="large"
					loading={selectedRating === 1}
					onClick={() => onRate(1)}
					disabled={disabled && selectedRating !== 1}
					style={getButtonStyle(1, colors[1])}
				>
					{t('rateAgain')}
				</Button>

				{/* Rating 2 (Hard) is intentionally omitted for simplicity */}

				<Button
					size="large"
					loading={selectedRating === 3}
					onClick={() => onRate(3)}
					disabled={disabled && selectedRating !== 3}
					style={getButtonStyle(3, colors[3])}
				>
					{t('rateGood')}
				</Button>

				<Button
					size="large"
					loading={selectedRating === 4}
					onClick={() => onRate(4)}
					disabled={disabled && selectedRating !== 4}
					style={getButtonStyle(4, colors[4])}
				>
					{t('rateEasy')}
				</Button>
			</div>
		</div>
	);
}
