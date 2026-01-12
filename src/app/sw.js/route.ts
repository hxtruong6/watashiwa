import { existsSync, readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import { join } from 'path';

/**
 * Service Worker Route Handler
 *
 * This route handler serves the service worker file directly
 * to prevent Next.js from processing it through its internal
 * routing/streaming system, which causes TransformStream errors.
 *
 * Service workers must be served with:
 * - Content-Type: application/javascript
 * - No caching headers (or short cache) to ensure updates are picked up
 * - Direct file serving without transformation
 */
export async function GET() {
	try {
		// Try multiple paths to support both development and standalone production builds
		const possiblePaths = [
			// Development: public folder at project root
			join(process.cwd(), 'public', 'sw.js'),
			// Standalone production: public folder in standalone directory
			join(process.cwd(), '.next', 'standalone', 'public', 'sw.js'),
			// Fallback: relative to current working directory
			join(process.cwd(), 'sw.js'),
		];

		let swContent: string | null = null;
		for (const swPath of possiblePaths) {
			if (existsSync(swPath)) {
				swContent = readFileSync(swPath, 'utf-8');
				break;
			}
		}

		if (!swContent) {
			console.error('Service worker file not found in any expected location');
			return new NextResponse('Service worker not found', {
				status: 404,
				headers: {
					'Content-Type': 'text/plain',
				},
			});
		}

		return new NextResponse(swContent, {
			status: 200,
			headers: {
				'Content-Type': 'application/javascript; charset=utf-8',
				// Service workers should not be cached aggressively
				// Short cache to allow updates, but prevent excessive requests
				'Cache-Control': 'public, max-age=0, must-revalidate',
				// Service worker scope header (optional, but good practice)
				'Service-Worker-Allowed': '/',
			},
		});
	} catch (error) {
		console.error('Failed to serve service worker:', error);
		return new NextResponse('Service worker not found', {
			status: 404,
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	}
}
