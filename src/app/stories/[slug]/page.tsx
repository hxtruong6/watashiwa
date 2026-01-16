/**
 * Story Reader Page
 *
 * Route: /stories/[slug]
 * Dynamic route for reading contextual stories
 */
import { getStoryAction } from '@/modules/priming/actions';
import { StoryReader } from '@/modules/priming/components/StoryReader';
import { Skeleton, Space } from 'antd';
import { Suspense } from 'react';

interface StoryPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ locale?: string }>;
}

export default async function StoryPage({ params, searchParams }: StoryPageProps) {
	const { slug } = await params;
	const { locale = 'en' } = await searchParams;

	// Get current user
	// const user = await getUser();
	// if (!user) {
	// 	redirect('/auth/login?redirect=/stories/' + slug);
	// }

	// Fetch story data
	const result = await getStoryAction({
		slug,
		language: locale as 'en' | 'vi',
	});

	if (!result.success || !result.data?.story) {
		return (
			<div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
				<h1>Story Not Found</h1>
				<p>The story you&apos;re looking for doesn&apos;t exist or has been removed.</p>
			</div>
		);
	}

	const { story, hasRead, progress } = result.data;

	return (
		<div style={{ padding: '24px' }}>
			<Suspense fallback={<StoryReaderSkeleton />}>
				<StoryReader
					story={story}
					locale={locale as 'en' | 'vi'}
					onComplete={() => {
						// Redirect to story list after completion
						window.location.href = '/stories';
					}}
				/>
			</Suspense>

			{/* Debug Info (remove in production) */}
			{process.env.NODE_ENV === 'development' && (
				<div
					style={{
						marginTop: '48px',
						padding: '16px',
						backgroundColor: '#f5f5f5',
						borderRadius: '8px',
					}}
				>
					<h3>Debug Info</h3>
					<pre>{JSON.stringify({ slug, hasRead, progress }, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}

/**
 * Loading Skeleton for Story Reader
 */
function StoryReaderSkeleton() {
	return (
		<div style={{ maxWidth: '800px', margin: '0 auto' }}>
			<Space orientation="vertical" size={24} style={{ width: '100%' }}>
				<Skeleton active paragraph={{ rows: 2 }} />
				<Skeleton active paragraph={{ rows: 8 }} />
			</Space>
		</div>
	);
}

/**
 * Metadata for SEO
 */
export async function generateMetadata({ params }: StoryPageProps) {
	const { slug } = await params;

	// Fetch story title (simplified for now)
	return {
		title: `Story: ${slug} | WatashiWa`,
		description: 'Learn Japanese vocabulary through contextual stories',
	};
}
