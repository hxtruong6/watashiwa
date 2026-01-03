import { getLocaleForMetadata } from '@/lib/seo/locale';
import { generatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import CubeIntroduction from './CubeIntroduction';

export async function generateMetadata(): Promise<Metadata> {
	// Get locale from request context (cookies) with fallback to default
	const locale = await getLocaleForMetadata();
	const t = await getTranslations({ locale, namespace: 'Profile' });

	return generatePageMetadata({
		title: t('cubeMethodTitle') || 'The CUBE Method',
		description:
			t('cubeMethodIntroduction') ||
			"CUBE (Context, Understanding, Blocking, Encoding) is WatashiWa's revolutionary learning method that goes beyond traditional spaced repetition.",
		url: '/info/cube',
		locale,
		canonical: '/info/cube',
		keywords: [
			'CUBE method',
			'Japanese vocabulary',
			'semantic learning',
			'spaced repetition',
			'language learning',
			'vocabulary acquisition',
		],
	});
}

export default async function CubeInfoPage() {
	return (
		<Suspense
			fallback={
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					Loading...
				</div>
			}
		>
			<CubeIntroduction />
		</Suspense>
	);
}
