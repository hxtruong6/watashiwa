/**
 * useMemoryGardenAnimation Hook
 *
 * Future-ready animation system for per-tile animations.
 * Currently supports pulse and repair modes.
 *
 * Architecture: Plugin-based system for easy feature addition.
 * - Each animation type is a separate "plugin"
 * - Hooks into useFrame for smooth 60fps updates
 * - Can be extended for: hover effects, growth animations, word labels, etc.
 */
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

export interface AnimationPlugin {
	name: string;
	update: (delta: number, mesh: THREE.InstancedMesh, tileStates: TileAnimationState[]) => void;
}

export interface TileAnimationState {
	index: number;
	baseColor: THREE.Color;
	currentColor: THREE.Color;
	animationPhase: number; // 0-1 for interpolation
	animationType: 'pulse' | 'repair' | 'static' | 'hover' | 'growth';
}

/**
 * Pulse Animation Plugin
 *
 * Makes red tiles (leeches) pulse for attention.
 * Uses sine wave for smooth pulsing effect.
 */
export const pulseAnimationPlugin: AnimationPlugin = {
	name: 'pulse',
	update: (delta, mesh, tileStates) => {
		if (!mesh.geometry) return;

		const colorAttr = mesh.geometry.getAttribute('color') as THREE.InstancedBufferAttribute;
		if (!colorAttr) return;

		const colorArray = colorAttr.array as Float32Array;
		const time = Date.now() * 0.001; // Convert to seconds

		for (const state of tileStates) {
			if (state.animationType === 'pulse') {
				// Sine wave: 0.8 to 1.2 intensity
				const pulse = 0.8 + Math.sin(time * 2 + state.index) * 0.2;
				state.currentColor.copy(state.baseColor).multiplyScalar(pulse);
				state.currentColor.toArray(colorArray, state.index * 3);
			}
		}

		colorAttr.needsUpdate = true;
	},
};

/**
 * Repair Animation Plugin
 *
 * Animates color transition from red to green when tile is repaired.
 * Uses smooth interpolation over time.
 */
export const repairAnimationPlugin: AnimationPlugin = {
	name: 'repair',
	update: (delta, mesh, tileStates) => {
		if (!mesh.geometry) return;

		const colorAttr = mesh.geometry.getAttribute('color') as THREE.InstancedBufferAttribute;
		if (!colorAttr) return;

		const colorArray = colorAttr.array as Float32Array;
		const targetColor = new THREE.Color('#708238'); // Matcha green

		for (const state of tileStates) {
			if (state.animationType === 'repair') {
				// Interpolate from current to target
				state.animationPhase = Math.min(1, state.animationPhase + delta * 2); // 0.5s duration
				state.currentColor.lerpColors(state.baseColor, targetColor, state.animationPhase);
				state.currentColor.toArray(colorArray, state.index * 3);
			}
		}

		colorAttr.needsUpdate = true;
	},
};

/**
 * Hook for managing animations
 *
 * Usage:
 * - Register animation plugins
 * - Update runs every frame (60fps)
 * - Can be extended for hover, growth, etc.
 *
 * Performance:
 * - Only updates colors (lightweight)
 * - Skips if no animations active
 * - Batches updates per frame
 */
export function useMemoryGardenAnimation(
	meshRef: React.RefObject<THREE.InstancedMesh>,
	animationMode: 'static' | 'repair' | 'pulse',
	enabled: boolean = true,
) {
	const tileStatesRef = useRef<Map<number, TileAnimationState>>(new Map());
	const pluginsRef = useRef<AnimationPlugin[]>([]);

	// Register plugins based on animation mode (use useEffect to avoid render-time ref updates)
	React.useEffect(() => {
		if (animationMode === 'pulse') {
			pluginsRef.current = [pulseAnimationPlugin];
		} else if (animationMode === 'repair') {
			pluginsRef.current = [repairAnimationPlugin];
		} else {
			pluginsRef.current = [];
		}
	}, [animationMode]);

	// Animation loop (runs every frame)
	useFrame((state, delta) => {
		if (!enabled || !meshRef.current || pluginsRef.current.length === 0) {
			return;
		}

		const mesh = meshRef.current;
		const tileStates = Array.from(tileStatesRef.current.values());

		// Run each plugin
		for (const plugin of pluginsRef.current) {
			plugin.update(delta, mesh, tileStates);
		}
	});

	return {
		registerTile: (
			index: number,
			baseColor: THREE.Color,
			animationType: TileAnimationState['animationType'],
		) => {
			tileStatesRef.current.set(index, {
				index,
				baseColor: baseColor.clone(),
				currentColor: baseColor.clone(),
				animationPhase: 0,
				animationType,
			});
		},
		unregisterTile: (index: number) => {
			tileStatesRef.current.delete(index);
		},
	};
}
