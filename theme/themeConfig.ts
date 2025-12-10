import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
	token: {
		fontFamily: 'Inter, Noto Sans JP, sans-serif',
		fontSize: 16,

		// Primary Color: Indigo (Ai-iro)
		colorPrimary: '#1E3A5F',

		// Success: Matcha (Uguisu-iro)
		colorSuccess: '#708238',

		// Error: Vermilion (Shuiro)
		colorError: '#E64A19',

		// Warning: Golden? Default is usually okay but let's stick to standard palette for now

		// Backgrounds
		colorBgBase: '#FFFFFF', // Component background
		colorBgLayout: '#F9F7F2', // App background (Washi)

		// Text
		colorText: '#2D2D2D', // Sumi
		colorTextSecondary: '#8C8C8C', // Stone

		borderRadius: 8,
	},
	components: {
		Layout: {
			bodyBg: '#F9F7F2',
			headerBg: '#FFFFFF',
			siderBg: '#FFFFFF',
		},
		Card: {
			boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Elevation-2
		},
		Button: {
			fontWeight: 600,
		},
		Typography: {
			fontSizeHeading1: 40,
			fontSizeHeading2: 32,
			fontSizeHeading3: 24,
		},
	},
};

export default theme;
