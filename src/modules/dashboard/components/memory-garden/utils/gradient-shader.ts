/**
 * Gradient Shader Material
 *
 * Custom shader material for gradient effects on tiles.
 * Interpolates from base color to top color based on vertex Y position.
 */
import * as THREE from 'three';

/**
 * Vertex shader for gradient effect
 * Interpolates color from base to top based on Y position
 * Works with InstancedMesh - uses instance attributes
 */
const vertexShader = `
  precision highp float;
  
  attribute vec3 baseColor;
  attribute vec3 topColor;
  varying vec3 vBaseColor;
  varying vec3 vTopColor;
  varying float vLocalY;

  void main() {
    vBaseColor = baseColor;
    vTopColor = topColor;
    // Use local Y position (0 to 1) for gradient interpolation
    // Position is in local space (-0.5 to 0.5 for a unit box)
    vLocalY = clamp((position.y + 0.5) / 1.0, 0.0, 1.0); // Normalize to 0-1
    // Transform position with instance matrix
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for gradient effect
 * Interpolates between base and top color based on local Y position
 */
const fragmentShader = `
  precision highp float;
  
  varying vec3 vBaseColor;
  varying vec3 vTopColor;
  varying float vLocalY;

  void main() {
    // Interpolate between base and top color based on local Y
    vec3 color = mix(vBaseColor, vTopColor, vLocalY);
    
    // Clamp color to valid range
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Create gradient shader material
 *
 * @param baseColors - Array of base colors (one per tile)
 * @param topColors - Array of top colors (one per tile)
 * @param minY - Minimum Y position for gradient normalization (unused, kept for compatibility)
 * @param maxY - Maximum Y position for gradient normalization (unused, kept for compatibility)
 */
export function createGradientShaderMaterial(
	baseColors: Float32Array,
	topColors: Float32Array,
	minY: number = -1.0,
	maxY: number = 2.0,
): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader,
		vertexColors: false, // We use custom attributes
	});
}

/**
 * Setup gradient attributes on geometry
 *
 * @param geometry - The geometry to add attributes to
 * @param baseColors - Array of base colors (one per tile)
 * @param topColors - Array of top colors (one per tile)
 */
export function setupGradientAttributes(
	geometry: THREE.BufferGeometry,
	baseColors: Float32Array,
	topColors: Float32Array,
): void {
	// Add base color attribute
	const baseColorAttr = new THREE.InstancedBufferAttribute(baseColors, 3, false);
	geometry.setAttribute('baseColor', baseColorAttr);

	// Add top color attribute
	const topColorAttr = new THREE.InstancedBufferAttribute(topColors, 3, false);
	geometry.setAttribute('topColor', topColorAttr);
}
