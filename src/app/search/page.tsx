import { getUser } from '@/modules/auth/auth.actions';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import SearchPageClient from './SearchPageClient';

export default async function SearchPage() {
	await connection();
	const user = await getUser();

	if (!user) {
		redirect('/login');
	}

	return <SearchPageClient user={user} />;
}
