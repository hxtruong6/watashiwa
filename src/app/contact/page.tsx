import { generatePageMetadata } from '@/lib/seo/metadata';
import { CompactSkeleton } from '@/modules/ui/components/skeletons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ClientContactContent from './ClientContactContent';

// Static metadata - avoids Sentry crypto.randomUUID() issue during prerendering
// Uses default locale (vi) for title/description, but alternates.languages includes both locales
const locale = 'vi' as const;

export const metadata: Metadata = generatePageMetadata({
	title: 'Liên hệ | WatashiWa',
	description:
		'Liên hệ với đội ngũ WatashiWa để được hỗ trợ, yêu cầu tính năng, báo cáo lỗi hoặc câu hỏi chung.',
	url: '/contact',
	locale,
	canonical: '/contact',
});

async function ContactHeader() {
	const t = await getTranslations('Contact');
	return (
		<header style={{ marginBottom: 24 }}>
			<h1 style={{ fontSize: 32, margin: 0, marginBottom: 8 }}>{t('title')}</h1>
			<p style={{ fontSize: 18, margin: 0 }}>{t('subtitle')}</p>
		</header>
	);
}

export default async function ContactPage() {
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
				<ContactHeader />
			</Suspense>

			{/* Dynamic hole - streams in client-side with Ant Design */}
			<ClientContactContent />
		</article>
	);
}
