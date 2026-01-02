import enMessages from '@/i18n/messages/en.json';
import viMessages from '@/i18n/messages/vi.json';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Suspense } from 'react';

import ClientDataRightsContent from './ClientDataRightsContent';

// Metadata generation can use default locale for static pages
export async function generateMetadata(): Promise<Metadata> {
	// Use default locale statically - no dynamic data access during prerendering
	const locale = routing.defaultLocale as 'vi' | 'en';
	const messages = locale === 'vi' ? viMessages : enMessages;
	const t = messages.Legal.dataRights;

	return {
		title: t.metaTitle,
		description: t.metaDescription,
		openGraph: {
			title: t.metaTitle,
			description: t.metaDescription,
			url: `https://watashiwa.app/data-rights`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/data-rights',
		},
	};
}

// Component that fetches translations - wrapped in Suspense for cacheComponents
async function DataRightsHeader() {
	await connection(); // Wait for user request - getTranslations() may access cookies()
	const t = await getTranslations('Legal.dataRights');

	return (
		<header style={{ marginBottom: 24 }}>
			<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{t('title')}</h1>
			<p style={{ fontSize: 14, margin: 0, color: '#8c8c8c' }}>
				{t('lastUpdated')}: {t('lastUpdatedDate')}
			</p>
		</header>
	);
}

export default async function DataRightsPage() {
	return (
		<article
			style={{
				maxWidth: 900,
				margin: '0 auto',
				padding: '48px 24px',
				minHeight: 'calc(100vh - 200px)',
			}}
		>
			{/* Wrap translation fetching in Suspense for Partial Prerendering */}
			<Suspense fallback={<div style={{ height: 80 }} />}>
				<DataRightsHeader />
			</Suspense>

			{/* Dynamic hole - streams in client-side with Ant Design */}
			<ClientDataRightsContent />
		</article>
	);
}
