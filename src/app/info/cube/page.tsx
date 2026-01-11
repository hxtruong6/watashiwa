import { generatePageMetadata } from '@/lib/seo/metadata';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import CubeIntroduction from './CubeIntroduction';

// Static metadata - avoids Sentry crypto.randomUUID() issue during prerendering
// Uses default locale (vi) for title/description, but alternates.languages includes both locales
const locale = 'vi' as const;

export const metadata: Metadata = generatePageMetadata({
	title: 'Phương Pháp CUBE | WatashiWa',
	description:
		'CUBE (Context, Understanding, Blocking, Encoding) là phương pháp học cách mạng của WatashiWa vượt xa lặp lại cách quãng truyền thống. Thay vì coi từ như các mục riêng lẻ, CUBE tạo ra các kết nối có ý nghĩa giữa các từ vựng liên quan, giúp bạn xây dựng hiểu biết sâu sắc hơn về tiếng Nhật.',
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

export default async function CubeInfoPage() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<CubeIntroduction />
		</Suspense>
	);
}
