import { routing } from '@/i18n/routing';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getUser, syncUser } from '@/modules/auth/auth.actions';
import DeckList from '@/modules/deck/components/DeckList';
import { getDecks } from '@/modules/deck/deck.actions';
import { ListSkeleton, PageSkeleton } from '@/modules/ui/components/skeletons';
import { Skeleton } from 'antd';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
	// Use default locale statically - no dynamic data access during prerendering
	const locale = routing.defaultLocale as 'vi' | 'en';
	return generatePageMetadata({
		title: locale === 'vi' ? 'Bộ thẻ từ vựng' : 'Vocabulary Decks',
		description:
			locale === 'vi'
				? 'Quản lý và học từ vựng tiếng Nhật với các bộ thẻ được tạo sẵn hoặc tự tạo.'
				: 'Manage and learn Japanese vocabulary with pre-made or custom decks.',
		locale,
		url: '/decks',
		noindex: true, // Private page - requires authentication
	});
}

// Component that handles auth and fetches decks data - wrapped in Suspense for cacheComponents
async function DecksContent() {
	await connection();
	// Sync user on load
	await syncUser();
	const user = await getUser();
	if (!user) {
		redirect('/login');
	}

	const decks = await getDecks();

	return <DeckList decks={decks} userId={user.id} />;
}

export default async function DecksPage() {
	// Wrap auth checks and data fetching in Suspense for Partial Prerendering compatibility
	return (
		<Suspense fallback={<ListSkeleton count={8} />}>
			<DecksContent />
		</Suspense>
	);
}
