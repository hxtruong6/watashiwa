'use client';

import { theme } from 'antd';
import React, { memo } from 'react';

const { useToken } = theme;

interface GlassDockProps {
	children: React.ReactNode;
	style?: React.CSSProperties;
	/**
	 * Intensity of the glass effect
	 * - 'light': Subtle blur, more transparent (for overlays)
	 * - 'medium': Standard iOS 16 style (default)
	 * - 'strong': Heavier blur, more opaque (for floating elements)
	 */
	intensity?: 'light' | 'medium' | 'strong';
	/**
	 * Enable mesh gradient overlay for depth (iOS 16+ style)
	 */
	enableMeshGradient?: boolean;
}

/**
 * GlassDock Component
 * iOS 16-inspired glass morphism with enhanced materials, blur, and depth
 *
 * Features:
 * - Layered blur system (backdrop + surface)
 * - Mesh gradient overlays for depth
 * - Enhanced dark mode materials
 * - Variable opacity based on intensity
 * - Subtle border with gradient
 */
function GlassDock({
	children,
	style,
	intensity = 'medium',
	enableMeshGradient = true,
}: GlassDockProps) {
	const { token } = useToken();

	// Determine if dark mode
	const isDark = token.colorBgBase === '#151F32';

	// Intensity-based configuration
	const intensityConfig = {
		light: {
			opacity: 0.7,
			blur: 'blur(12px)',
			borderOpacity: 0.15,
			shadowIntensity: 0.1,
		},
		medium: {
			opacity: 0.85,
			blur: 'blur(20px)',
			borderOpacity: 0.2,
			shadowIntensity: 0.15,
		},
		strong: {
			opacity: 0.92,
			blur: 'blur(28px)',
			borderOpacity: 0.25,
			shadowIntensity: 0.2,
		},
	};

	const config = intensityConfig[intensity];

	// Enhanced shadow system for depth
	const shadowColor = isDark
		? `rgba(0, 0, 0, ${0.4 * config.shadowIntensity})`
		: `rgba(0, 0, 0, ${0.08 * config.shadowIntensity})`;

	// Inner glow for light mode (iOS 16 style)
	const innerGlow = !isDark ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)` : 'none';

	// Mesh gradient overlay (iOS 16+ style)
	// Creates subtle depth and material richness
	const meshGradient = enableMeshGradient
		? isDark
			? `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)`
			: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`
		: 'none';

	return (
		<div
			style={{
				// Base glass material (use backgroundColor to avoid conflicting with backgroundImage)
				backgroundColor: `color-mix(in srgb, ${token.colorBgContainer} ${config.opacity * 100}%, transparent)`,

				// Mesh gradient overlay for depth (iOS 16 style)
				backgroundImage: meshGradient,

				// Enhanced blur system
				backdropFilter: `${config.blur} saturate(180%)`,
				WebkitBackdropFilter: `${config.blur} saturate(180%)`, // Safari support

				// Refined border with gradient effect
				border: `1px solid color-mix(in srgb, ${token.colorBorderSecondary} ${config.borderOpacity * 100}%, transparent)`,
				borderRadius: '24px',

				// Enhanced shadow system
				boxShadow: `${innerGlow}, 0 8px 32px ${shadowColor}, 0 2px 8px ${shadowColor}`,

				// Base styling
				padding: '8px 16px',
				display: 'flex',
				alignItems: 'center',
				gap: '16px',

				// Smooth transitions
				transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',

				// Performance optimizations
				willChange: 'transform',
				transform: 'translateZ(0)', // Force GPU acceleration

				...style,
			}}
		>
			{children}
		</div>
	);
}

export default memo(GlassDock);
