import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

const baseToken = {
	fontFamily: 'Inter, Noto Sans JP, sans-serif',
	fontSize: 16,
	borderRadius: 8,
};

const baseComponents = {
	Button: {
		fontWeight: 600,
	},
	Typography: {
		fontSizeHeading1: 40,
		fontSizeHeading2: 32,
		fontSizeHeading3: 24,
	},
};

export const lightTheme: ThemeConfig = {
	token: {
		...baseToken,
		// Primary Color: Indigo (Ai-iro)
		colorPrimary: '#1E3A5F',

		// Success: Matcha (Uguisu-iro)
		colorSuccess: '#708238',

		// Error: Vermilion (Shuiro)
		colorError: '#E64A19',

		// Backgrounds
		colorBgBase: '#FFFFFF', // Component background
		colorBgLayout: '#F9F7F2', // App background (Washi)

		// Text
		colorText: '#2D2D2D', // Sumi
		colorTextSecondary: '#8C8C8C', // Stone
	},
	components: {
		...baseComponents,
		Layout: {
			bodyBg: '#F9F7F2',
			headerBg: '#FFFFFF',
			siderBg: '#FFFFFF',
		},
		Card: {
			boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		},
		Segmented: {
			itemSelectedColor: '#1E3A5F',
		},
	},
};

export const darkTheme: ThemeConfig = {
	algorithm: theme.darkAlgorithm,
	token: {
		...baseToken,
		// Primary: Lighter, vivid Indigo for dark mode contrast
		colorPrimary: '#63B3ED', // Clear Sky Blue - Readable on dark

		// Semantic Colors - Adjusted for dark mode legibility
		colorSuccess: '#68D391', // Emerald 300
		colorError: '#FC8181', // Red 300
		colorWarning: '#F6E05E', // Yellow 300

		// Backgrounds (Zen Night Palette)
		colorBgBase: '#151F32', // Surface (Card/Nav) - Deep Slate
		colorBgLayout: '#0B1120', // Main Background - Midnight
		colorBgContainer: '#151F32',

		// Text - High Contrast
		colorText: 'rgba(255, 255, 255, 0.92)', // Almost white
		colorTextSecondary: 'rgba(255, 255, 255, 0.65)', // Readable grey
		colorTextTertiary: 'rgba(255, 255, 255, 0.45)',

		// Borders - Crucial for "Clear" UI in dark mode
		colorBorder: '#2D3748', // Slate 700
		colorBorderSecondary: '#1A202C', // Slate 900
	},
	components: {
		...baseComponents,
		Layout: {
			bodyBg: '#0B1120',
			headerBg: '#151F32',
			siderBg: '#151F32',
		},
		Card: {
			colorBgContainer: '#151F32',
			// Add a subtle border to separate cards from the deep background
			actionsBg: '#111927',
			headerBg: '#151F32',
		},
		Button: {
			...baseComponents.Button,
			// Ensure primary buttons pop
			primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.45)',
		},
		Typography: {
			...baseComponents.Typography,
			colorTextHeading: '#FFFFFF', // Pure white headings
		},
	},
};

// Reusable Ambient Gradients for that "Zen" feel
export const ambientGradients = {
	primaryBlob: 'radial-gradient(circle, rgba(112, 130, 56, 0.15) 0%, rgba(255,255,255,0) 70%)',
	secondaryBlob: (color: string) =>
		`radial-gradient(circle, ${color}1a 0%, rgba(255,255,255,0) 70%)`,
};

export const customShadows = {
	glassCard: {
		light: '0 30px 60px -15px rgba(0, 0, 0, 0.15)',
		dark: '0 30px 60px -15px rgba(0, 0, 0, 0.3)',
	},
};

export default lightTheme;
