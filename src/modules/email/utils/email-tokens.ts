/**
 * Email Design Tokens
 * Aligned with design system: "Zen Mastery"
 *
 * Note: Email clients don't support CSS variables, so we use static values.
 * We use light theme colors as emails are typically viewed in light mode.
 */
export const emailTokens = {
	// Colors (from design system - light theme)
	colors: {
		primary: '#1E3A5F', // Indigo (Ai-iro) - Primary actions, headers
		success: '#708238', // Matcha (Uguisu-iro) - Success states
		error: '#E64A19', // Vermilion (Shuiro) - Error states
		warning: '#FAAD14', // Warning states
		bgBase: '#F9F7F2', // Washi - App background
		bgContainer: '#FFFFFF', // White - Cards, modals
		text: '#2D2D2D', // Sumi - Primary text
		textSecondary: '#8C8C8C', // Stone - Secondary text
		textTertiary: '#999999', // Lighter text
		border: '#EEEEEE', // Light border
		link: '#1E3A5F', // Primary color for links
		white: '#FFFFFF', // White - For text on colored backgrounds
	},

	// Typography (from design system)
	typography: {
		fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
		fontSizeHero: '28px', // Hero/Header text
		fontSizeTitle: '24px', // Page title
		fontSizeBody: '16px', // Body text
		fontSizeCaption: '14px', // Meta/Caption
		fontWeightBold: '600',
		fontWeightNormal: '400',
	},

	// Spacing (from design system)
	spacing: {
		paddingLG: '40px',
		paddingMD: '30px',
		paddingSM: '20px',
		paddingXS: '16px',
	},

	// Shape
	shape: {
		borderRadius: '8px',
		borderRadiusLarge: '12px',
	},
} as const;
