import { redirect } from 'next/navigation';
import { getDecks, syncUser, getUser } from '@/services/actions';
import DecksContent from '@/components/DecksContent';

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
