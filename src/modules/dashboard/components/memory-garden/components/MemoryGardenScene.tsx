/**
 * MemoryGardenScene Component
 *
 * Three.js scene setup (lighting, controls, etc.)
 * Separated for reusability and testing.
 */
import { OrbitControls, Stats } from '@react-three/drei';
import { Suspense } from 'react';

import { GARDEN_CONFIG } from '../config';
import { useCameraZoom } from '../hooks';
import type { MemoryTile } from '../types';
import type { MemoryGardenMeshProps } from './MemoryGardenMesh';
import { MemoryGardenMesh } from './MemoryGardenMesh';

export interface MemoryGardenSceneProps extends MemoryGardenMeshProps {
	showControls?: boolean;
	autoRotate?: boolean;
	tiles?: MemoryTile[];
	gridSize?: number;
}

/**
 * Scene wrapper with lighting and controls
 */
export function MemoryGardenScene({
	showControls = true,
	autoRotate = true,
	gridSize = 10,
	...meshProps
}: MemoryGardenSceneProps) {
	// Camera zoom functionality (ready for future use)
	useCameraZoom({
		gridSize,
		enabled: true,
	});

	return (
		<>
			{/* Enhanced Lighting for better depth perception */}
			<ambientLight intensity={GARDEN_CONFIG.lighting.ambient.intensity} />
			<directionalLight
				position={GARDEN_CONFIG.lighting.main.position}
				intensity={GARDEN_CONFIG.lighting.main.intensity}
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={50}
				shadow-camera-left={-10}
				shadow-camera-right={10}
				shadow-camera-top={10}
				shadow-camera-bottom={-10}
			/>
			<directionalLight
				position={GARDEN_CONFIG.lighting.fill.position}
				intensity={GARDEN_CONFIG.lighting.fill.intensity}
			/>
			{/* Point light for rim lighting (adds depth) */}
			<pointLight position={[-10, 5, -10]} intensity={0.3} color="#ffffff" />

			{/* Main Garden Mesh */}
			<Suspense fallback={null}>
				<MemoryGardenMesh {...meshProps} />
			</Suspense>

			{/* Camera Controls */}
			{showControls && (
				<OrbitControls
					autoRotate={autoRotate}
					autoRotateSpeed={0.5}
					enableZoom={true}
					enablePan={false}
					minDistance={GARDEN_CONFIG.camera.minDistance}
					maxDistance={GARDEN_CONFIG.camera.maxDistance}
				/>
			)}

			{/* Performance Stats (Dev only) */}
			{process.env.NODE_ENV === 'development' && <Stats />}
		</>
	);
}
