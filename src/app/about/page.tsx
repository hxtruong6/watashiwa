import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Suspense } from 'react';

import ClientAboutContent from './ClientAboutContent';

export async function generateMetadata(): Promise<Metadata> {
	await connection();
	const t = await getTranslations('About');

	return {
		title: t('metaTitle'),
		description: t('metaDescription'),
		openGraph: {
			title: t('metaTitle'),
			description: t('metaDescription'),
			url: `https://watashiwa.app/about`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/about',
		},
	};
}

async function AboutHeader() {
	const t = await getTranslations('About');
	return (
		<header style={{ marginBottom: 24 }}>
			<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{t('title')}</h1>
			<p style={{ fontSize: 18, margin: 0 }}>{t('subtitle')}</p>
		</header>
	);
}

export default async function AboutPage() {
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
				<AboutHeader />
			</Suspense>

			{/* Dynamic hole - streams in client-side with Ant Design */}
			<ClientAboutContent />
		</article>
	);
}
