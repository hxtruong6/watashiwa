/**
 * Story Reader Page
 *
 * Route: /stories/[slug]
 * Dynamic route for reading contextual stories
 */
import { getCookiesSafely } from '@/i18n/request';
import { routing } from '@/i18n/routing';
import { getStoryAction } from '@/modules/priming/actions';
import { StoryReader } from '@/modules/priming/components/StoryReader';
import { getUserSettings } from '@/modules/user/user.actions';
import { Skeleton, Space } from 'antd';
import { Suspense } from 'react';

interface StoryPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ locale?: string }>;
}

export default async function StoryPage({ params, searchParams }: StoryPageProps) {
	const { slug } = await params;
	const searchParamsData = await searchParams;

	// Language priority:
	// 1. User language setting (from cookie/DB) - for initial load
	// 2. Story language selector (URL param) - user can switch without impacting global setting
	// 3. Default to "en" if no option available
	const validStoryLocales = ['en', 'vi', 'ja'] as const;
	type StoryLocale = 'en' | 'vi' | 'ja';

	// Get user language preference (for translation fallback and initial story language)
	const cookieStore = await getCookiesSafely();
	let userLanguage: 'en' | 'vi' = 'en'; // Default to 'en'

	if (cookieStore) {
		const cookieValue = cookieStore.get('NEXT_LOCALE')?.value;
		if (cookieValue && routing.locales.includes(cookieValue as 'vi' | 'en')) {
			userLanguage = cookieValue as 'en' | 'vi';
		}
	}

	// If no cookie, try user DB setting
	if (userLanguage === 'en') {
		const userSettings = await getUserSettings();
		if (userSettings?.language && routing.locales.includes(userSettings.language as 'vi' | 'en')) {
			userLanguage = userSettings.language as 'en' | 'vi';
		}
	}

	// Determine story locale: URL param -> User language -> Default 'en'
	let locale: StoryLocale;
	const urlLocale = searchParamsData.locale as StoryLocale | undefined;

	if (urlLocale && validStoryLocales.includes(urlLocale)) {
		// User selected language in story selector (URL param)
		locale = urlLocale;
	} else {
		// Use user language preference, or default to 'en'
		locale = userLanguage;
	}

	// Get current user
	// const user = await getUser();
	// if (!user) {
	// 	redirect('/auth/login?redirect=/stories/' + slug);
	// }

	// Fetch story data
	// Note: language param is for analytics, story content includes all languages
	const result = await getStoryAction({
		slug,
		language: locale === 'ja' ? 'en' : (locale as 'en' | 'vi'), // Use 'en' as fallback for analytics when 'ja' is selected
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
					locale={locale}
					userLanguage={userLanguage}
					redirectOnComplete="/stories"
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
