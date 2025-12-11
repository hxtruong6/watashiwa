import React from 'react';
import { Button, Tooltip, ConfigProvider } from 'antd';
import { useTranslations } from 'next-intl';

interface RatingBarProps {
	onRate: (rating: number) => void;
	disabled?: boolean;
	selectedRating?: number | null;
}

export default function RatingBar({ onRate, disabled, selectedRating }: RatingBarProps) {
	const t = useTranslations('Study');
	// Local state not needed if controlled by parent used for animation trigger
	// But parent state `submittingRating` is perfect.

	// Colors: Theme Primary + Soft Background Tints
	const colors = {
		1: { primary: '#E64A19', bg: '#FFF1F0' }, // Again (Red)
		2: { primary: '#FAAD14', bg: '#FFF7E6' }, // Hard (Orange)
		3: { primary: '#708238', bg: '#F6FFED' }, // Good (Green)
		4: { primary: '#1E3A5F', bg: '#F0F5FF' }, // Easy (Blue)
	};

	const getButtonStyle = (rating: number, theme: { primary: string; bg: string }) => {
		const isSelected = selectedRating === rating;
		const isOthers = selectedRating !== null && selectedRating !== undefined && !isSelected;

		return {
			height: 56,
			fontSize: 16,
			fontWeight: 600,
			transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			opacity: isOthers ? 0.4 : 1, // Slightly higher opacity for legible fade
			transform: isSelected ? 'scale(1.02)' : 'scale(1)',

			// Tonal Style Logic
			// Default: Soft Background + Strong Text
			// Selected: Strong Background + White Text
			backgroundColor: isSelected ? theme.primary : theme.bg,
			color: isSelected ? '#fff' : theme.primary,
			borderColor: isSelected ? theme.primary : 'transparent', // Transparent border when tonal
			borderWidth: 1,
			borderStyle: 'solid',

			boxShadow: isSelected ? `0 8px 16px ${theme.primary}4D` : 'none', // Soft colored shadow on selection
		};
	};

	return (
		<div
			style={{
				marginTop: 16,
				padding: '16px',
				background: 'rgba(255, 255, 255, 0.95)',
				borderRadius: 24,
				boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
				backdropFilter: 'blur(12px)',
				width: '100%',
				maxWidth: 500,
			}}
		>
			<ConfigProvider
				theme={{
					components: {
						Button: {
							colorPrimary: '#1E3A5F', // Default fallback
							algorithm: true, // Enable derivative colors
						},
					},
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: 12,
					}}
				>
					<Tooltip title={t('shortcutTooltip', { key: 1 })}>
						<Button
							size="large"
							loading={selectedRating === 1}
							onClick={() => onRate(1)}
							disabled={disabled && selectedRating !== 1}
							style={{
								...getButtonStyle(1, colors[1]),
								gridColumn: '1 / 2',
							}}
						>
							{t('rateAgain')}
						</Button>
					</Tooltip>

					<Tooltip title={t('shortcutTooltip', { key: 2 })}>
						<Button
							size="large"
							loading={selectedRating === 2}
							onClick={() => onRate(2)}
							disabled={disabled && selectedRating !== 2}
							style={{
								...getButtonStyle(2, colors[2]),
								gridColumn: '2 / 3',
							}}
						>
							{t('rateHard')}
						</Button>
					</Tooltip>

					<Tooltip title={t('shortcutTooltip', { key: 3 })}>
						<Button
							size="large"
							loading={selectedRating === 3}
							onClick={() => onRate(3)}
							disabled={disabled && selectedRating !== 3}
							style={{
								...getButtonStyle(3, colors[3]),
								gridColumn: '1 / 2',
							}}
						>
							{t('rateGood')}
						</Button>
					</Tooltip>

					<Tooltip title={t('shortcutTooltip', { key: 4 })}>
						<Button
							size="large"
							loading={selectedRating === 4}
							onClick={() => onRate(4)}
							disabled={disabled && selectedRating !== 4}
							style={{
								...getButtonStyle(4, colors[4]),
								gridColumn: '2 / 3',
							}}
						>
							{t('rateEasy')}
						</Button>
					</Tooltip>
				</div>
			</ConfigProvider>

			{/* Responsive styles */}
			<style jsx>{`
				@media (min-width: 600px) {
					div[style*='gridTemplateColumns'] {
						display: flex !important;
						justify-content: space-between;
					}
					button {
						flex: 1;
						margin: 0 6px;
					}
				}
			`}</style>
		</div>
	);
}
