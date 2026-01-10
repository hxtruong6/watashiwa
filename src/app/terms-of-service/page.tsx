import { getLocaleForMetadata } from '@/lib/seo/locale';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { CompactSkeleton } from '@/modules/ui/components/skeletons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ClientTermsOfServiceContent from './ClientTermsOfServiceContent';

export async function generateMetadata(): Promise<Metadata> {
	// Get locale from request context (cookies) with fallback to default
	const locale = await getLocaleForMetadata();
	const t = await getTranslations({ locale, namespace: 'Legal.termsOfService' });

	return generatePageMetadata({
		title: t('metaTitle'),
		description: t('metaDescription'),
		url: '/terms-of-service',
		locale,
		canonical: '/terms-of-service',
	});
}

async function TermsOfServiceHeader() {
	const t = await getTranslations('Legal.termsOfService');
	return (
		<header style={{ marginBottom: 24 }}>
			<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{t('title')}</h1>
			<p style={{ fontSize: 14, margin: 0, color: '#8c8c8c' }}>
				{t('lastUpdated')}: {t('lastUpdatedDate')}
			</p>
		</header>
	);
}

export default async function TermsOfServicePage() {
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
				<TermsOfServiceHeader />
			</Suspense>

			{/* Dynamic hole - streams in client-side with Ant Design */}
			<ClientTermsOfServiceContent />
		</article>
	);
}
