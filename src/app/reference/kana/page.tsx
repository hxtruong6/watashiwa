import { generatePageMetadata } from '@/lib/seo/metadata';
import { KanaReferencePage } from '@/modules/kana-reference';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const locale = 'en' as const;

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('KanaReference');
	return generatePageMetadata({
		title: t('metaTitle'),
		description: t('metaDescription'),
		url: '/reference/kana',
		locale,
		canonical: '/reference/kana',
		keywords: ['Hiragana', 'Katakana', 'kana', 'Japanese', 'reference', 'romaji'],
	});
}

export default function ReferenceKanaPage() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<KanaReferencePage />
		</Suspense>
	);
}
