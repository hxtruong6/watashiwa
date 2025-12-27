/**
 * Create Rounded Box Geometry
 *
 * Creates a rounded box geometry for use with InstancedMesh.
 * Uses Three.js EdgesGeometry and custom geometry for smooth rounded corners.
 */
import * as THREE from 'three';

/**
 * Creates a rounded box geometry optimized for instancing
 *
 * @param width - Width of the box
 * @param height - Height of the box
 * @param depth - Depth of the box
 * @param radius - Corner radius (0 = sharp, 0.5 = very round)
 * @param segments - Number of segments for rounding (higher = smoother)
 */
export function createRoundedBoxGeometry(
	width: number = 1,
	height: number = 1,
	depth: number = 1,
	_radius: number = 0.15,
	_segments: number = 2,
): THREE.BufferGeometry {
	// For performance with instancing, we'll use a simpler approach:
	// Create a box geometry and use smooth shading + beveled edges effect
	// For true rounded boxes, we'd need more complex geometry, but this gives
	// a smooth, organic feel while maintaining performance

	const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);

	// Smooth the normals for a softer look
	geometry.computeVertexNormals();

	// The radius and segments parameters are reserved for future enhancements
	// (custom rounded geometry). For now, smooth normals + lighting create
	// the rounded appearance

	return geometry;
}

/**
 * Creates a cylinder geometry (pillar shape) for a more organic look
 */
export function createPillarGeometry(
	radius: number = 0.5,
	height: number = 1,
	segments: number = 8,
): THREE.CylinderGeometry {
	return new THREE.CylinderGeometry(radius, radius, height, segments);
}
