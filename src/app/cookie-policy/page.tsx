import { generatePageMetadata } from '@/lib/seo/metadata';
import { CompactSkeleton } from '@/modules/ui/components/skeletons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ClientCookiePolicyContent from './ClientCookiePolicyContent';

// Static metadata - avoids Sentry crypto.randomUUID() issue during prerendering
// Uses default locale (vi) for title/description, but alternates.languages includes both locales
const locale = 'vi' as const;

export const metadata: Metadata = generatePageMetadata({
	title: 'Chính Sách Cookie | WatashiWa',
	description:
		'Tìm hiểu về cách WatashiWa sử dụng cookie và các công nghệ tương tự để nâng cao trải nghiệm học tập của bạn.',
	url: '/cookie-policy',
	locale,
	canonical: '/cookie-policy',
});

async function CookiePolicyHeader() {
	const t = await getTranslations('Legal.cookiePolicy');
	return (
		<header style={{ marginBottom: 24 }}>
			<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{t('title')}</h1>
			<p style={{ fontSize: 14, margin: 0, color: '#8c8c8c' }}>
				{t('lastUpdated')}: {t('lastUpdatedDate')}
			</p>
		</header>
	);
}

export default async function CookiePolicyPage() {
	return (
		<article
			style={{
				maxWidth: 900,
				margin: '0 auto',
				padding: '48px 24px',
				minHeight: 'calc(100vh - 200px)',
			}}
		>
			{/* Static SEO-friendly shell - renders server-side for crawlers */}
			<Suspense
				fallback={
					<header style={{ marginBottom: 24 }}>
						<CompactSkeleton title rows={1} />
					</header>
				}
			>
				<CookiePolicyHeader />
			</Suspense>

			{/* Dynamic hole - streams in client-side with Ant Design */}
			<ClientCookiePolicyContent />
		</article>
	);
}
