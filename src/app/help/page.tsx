import enMessages from '@/i18n/messages/en.json';
import viMessages from '@/i18n/messages/vi.json';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ClientHelpContent from './ClientHelpContent';

export async function generateMetadata(): Promise<Metadata> {
	// Use default locale statically - no dynamic data access during prerendering
	const locale = routing.defaultLocale as 'vi' | 'en';
	const messages = locale === 'vi' ? viMessages : enMessages;
	const t = messages.Help;

	return {
		title: t.metaTitle,
		description: t.metaDescription,
		openGraph: {
			title: t.metaTitle,
			description: t.metaDescription,
			url: `https://watashiwa.app/help`,
			type: 'website',
		},
		alternates: {
			canonical: 'https://watashiwa.app/help',
		},
	};
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
