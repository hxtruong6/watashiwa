import { generatePageMetadata } from '@/lib/seo/metadata';
import { getUser, syncUser } from '@/modules/auth/auth.actions';
import DeckList from '@/modules/deck/components/DeckList';
import { getDecks } from '@/modules/deck/deck.actions';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
	const locale = (await getLocale()) as 'vi' | 'en';
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

export default async function DecksPage() {
	const user = await getUser();
	if (!user) {
		redirect('/login');
	}

	// Sync user on load
	await syncUser();
	const decks = await getDecks();

	return <DeckList decks={decks} userId={user.id} />;
}
