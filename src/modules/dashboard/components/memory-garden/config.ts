/**
 * Memory Garden Configuration
 *
 * Centralized configuration for the Memory Garden visualization.
 * This allows easy tweaking of visual parameters without touching component logic.
 */

// Visual Constants
export const GARDEN_CONFIG = {
	// Display Limits (Performance + Clarity)
	maxTilesDisplay: 100, // Maximum tiles to render (reduces crowding)
	maxLeechesDisplay: 20, // Maximum leeches to show (critical info)
	maxMasteredDisplay: 40, // Maximum mastered tiles to show
	maxLearningDisplay: 40, // Maximum learning tiles to show

	// Spacing & Layout
	tileSpacing: 1.5, // Gap between tiles (increased for breathing room)
	gridLayout: 'square' as const, // 'square' | 'rectangular' | 'circular'

	// Height Mapping (Topography)
	heights: {
		leechMin: -0.8, // Deepest depression (worst leeches - 5+ lapses)
		leechMax: -0.3, // Shallow depression (mild leeches - 3 lapses)
		new: 0.15, // Flat ground (new words)
		masteredMin: 0.3, // Minimum height for mastered
		masteredMax: 1.2, // Maximum height for mastered (8x difference!)
		stabilityCap: 100, // Days to cap stability normalization
		leechLapseCap: 8, // Max lapses to consider for height variation
	},

	// Color Palette (Vibrant & Engaging)
	colors: {
		mastered: '#10B981', // Mastery (Emerald Green - vibrant success)
		learning: '#3B82F6', // Learning (Bright Blue - progress)
		new: '#F3F4F6', // New (Light Gray - neutral)
		leech: '#EF4444', // Problem (Bright Red - urgent attention)
		// Gradient stops for smooth transitions
		gradient: {
			from: '#EF4444', // Red
			to: '#10B981', // Green
		},
		// Hover/Highlight colors
		hover: '#F59E0B', // Amber for hover state
		selected: '#8B5CF6', // Purple for selected tiles
	},

	// Material Properties
	material: {
		metalness: 0.2,
		roughness: 0.5,
		flatShading: false,
		// Rounded geometry settings
		roundRadius: 0.15, // Roundness of corners (0 = sharp, 1 = very round)
		// Visual enhancements
		emissiveIntensity: 0.2, // Subtle glow
		emissiveMultiplier: 1.5, // Glow intensity for leeches/mastered
	},

	// Camera Settings
	camera: {
		position: [12, 12, 12] as [number, number, number],
		fov: 50,
		minDistance: 8,
		maxDistance: 25,
	},

	// Lighting
	lighting: {
		ambient: { intensity: 0.5 },
		main: { position: [10, 20, 5] as [number, number, number], intensity: 1.2 },
		fill: { position: [-5, 10, -5] as [number, number, number], intensity: 0.4 },
	},

	// Animation Settings (Future-ready)
	animation: {
		pulseIntensity: 1.3, // Brightness multiplier for pulse mode
		repairTransition: 0.8, // Color interpolation for repair (0-1)
		frameRate: 60, // Target FPS for animations
	},

	// Feature Flags
	features: {
		enableGradients: false, // Temporarily disabled - enable after shader is fixed
		enableLabels: true,
		labelDisplayMode: 'hover' as 'hover' | 'click' | 'always', // Progressive disclosure
		enablePulse: true,
		enableColumnGrouping: false, // Feature flag
	},
} as const;

// Type-safe config access
export type GardenConfig = typeof GARDEN_CONFIG;
