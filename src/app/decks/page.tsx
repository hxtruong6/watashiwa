import DecksContent from '@/components/DecksContent';
import { getUser, syncUser } from '@/modules/auth/auth.actions';
import { getDecks } from '@/modules/deck/deck.actions';
import { redirect } from 'next/navigation';

export default async function DecksPage() {
	const user = await getUser();
	if (!user) {
		redirect('/login');
	}

	// Sync user on load
	await syncUser();
	const decks = await getDecks();

	return <DecksContent decks={decks} userId={user.id} />;
}
