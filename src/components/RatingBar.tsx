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
	// Hard (2): Bordered Orange
	// Good (3): Filled Green (Dominant)
	// Easy (4): Bordered Indigo
	const colors = {
		1: { primary: token.colorError, bg: '#FFF1F0' },
		2: { primary: token.colorWarning, bg: '#FFF7E6' },
		3: { primary: token.colorSuccess, bg: '#F6FFED' },
		4: { primary: token.colorPrimary, bg: '#F0F5FF' },
	};

	const getButtonStyle = (rating: number, colorTheme: { primary: string; bg: string }) => {
		const isSelected = selectedRating === rating;
		const isGood = rating === 3; // The "Golden Path" action

		// If Good (3): Solid style by default.
		// Others: Outlined style by default.
		// On Selection: All become "Solid" or maintain dominance?
		// Let's make selection just add a ring or scale, keeping base style logic but ensuring visibility.

		// Actually, standard practice:
		// Selected = Filled/Active state.
		// Unselected = Default state (Bordered or Filled based on priority).

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
			height: screens.xs ? 48 : 56,
			fontSize: screens.xs ? 14 : 16,
			fontWeight: 600,
			transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			transform: isActive ? 'scale(1.02)' : 'scale(1)',

			backgroundColor: background,
			color: color,
			border: border,
			boxShadow: boxShadow,
			opacity: disabled && !isActive ? 0.5 : 1,
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
				maxWidth: 600, // Allow wider on desktop
			}}
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: screens.md ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', // 4 col on tablet+, 2 col on mobile
					gap: screens.xs ? 8 : 12,
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

				<Button
					size="large"
					loading={selectedRating === 2}
					onClick={() => onRate(2)}
					disabled={disabled && selectedRating !== 2}
					style={getButtonStyle(2, colors[2])}
				>
					{t('rateHard')}
				</Button>

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
