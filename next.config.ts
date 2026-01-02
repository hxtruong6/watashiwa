import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
	// output: 'standalone', // For Production Build later
	async rewrites() {
		return [
			{
				source: '/ingest/static/:path*',
				destination: 'https://us-assets.i.posthog.com/static/:path*',
			},
			{
				source: '/ingest/:path*',
				destination: 'https://us.i.posthog.com/:path*',
			},
			{
				source: '/ingest/decide',
				destination: 'https://us.i.posthog.com/decide',
			},
		];
	},
	skipTrailingSlashRedirect: true,
	cacheComponents: true, // Partial Prerendering for SEO-friendly static shells
	experimental: {
		optimizePackageImports: [
			'antd',
			'@ant-design/icons',
			'framer-motion',
			'@lottiefiles/dotlottie-react',
			'date-fns',
			'zod',
			'zustand',
		],
	},
	transpilePackages: ['antd', '@ant-design/icons', 'next-intl'],
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
	},
	images: {
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60,
	},
	outputFileTracingExcludes: {
		'*': [
			'node_modules/@swc/core-linux-x64-gnu',
			'node_modules/@swc/core-linux-x64-musl',
			'node_modules/@esbuild/linux-x64',
			'node_modules/webpack',
		],
	},
	serverExternalPackages: ['mjml', 'uglify-js'], // This tells Next.js to use standard 'require' at runtime instead of dynamic import
};

export default withSentryConfig(withNextIntl(nextConfig), {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	// Suppresses source map uploading logs during build
	silent: true,
	org: 'watashiwa', // FIXME: Update with your org
	project: 'watashiwa-app', // FIXME: Update with your project

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	tunnelRoute: '/monitoring',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
});
