import { generatePageMetadata } from '@/lib/seo/metadata';
import { CompactSkeleton } from '@/modules/ui/components/skeletons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ClientAboutContent from './ClientAboutContent';

const locale = 'vi' as const;

export const metadata: Metadata = generatePageMetadata({
	title: 'Về WatashiWa | Học tiếng Nhật với SRS',
	description:
		'Tìm hiểu về sứ mệnh, tính năng, công nghệ và cam kết mã nguồn mở của WatashiWa trong việc học tiếng Nhật.',
	url: '/about',
	locale,
	canonical: '/about',
});

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
						<CompactSkeleton title rows={1} />
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
