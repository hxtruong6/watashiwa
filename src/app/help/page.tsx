import { getLocaleForMetadata } from '@/lib/seo/locale';
import { generatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ClientHelpContent from './ClientHelpContent';

export async function generateMetadata(): Promise<Metadata> {
	// Get locale from request context (cookies) with fallback to default
	const locale = await getLocaleForMetadata();
	const t = await getTranslations({ locale, namespace: 'Help' });

	return generatePageMetadata({
		title: t('metaTitle'),
		description: t('metaDescription'),
		url: '/help',
		locale,
		canonical: '/help',
	});
}

async function HelpHeader() {
	const t = await getTranslations('Help');
	return (
		<header style={{ marginBottom: 24 }}>
			<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{t('title')}</h1>
			<p style={{ fontSize: 18, margin: 0 }}>{t('subtitle')}</p>
		</header>
	);
}

export default async function HelpPage() {
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
						<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>Loading...</h1>
					</header>
				}
			>
				<HelpHeader />
			</Suspense>

			{/* Dynamic hole - streams in client-side with Ant Design */}
			<ClientHelpContent />
		</article>
	);
}
