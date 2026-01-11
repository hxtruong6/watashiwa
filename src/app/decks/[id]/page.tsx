import { isUUID } from '@/lib/utils/uuid';
import { getUser, syncUser } from '@/modules/auth/auth.actions';
import DeckView from '@/modules/deck/components/DeckView';
import { getDeck } from '@/modules/deck/deck.actions';
import { getDeckById } from '@/modules/deck/deck.data';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { type RedirectType, notFound, redirect } from 'next/navigation';
import React, { Suspense } from 'react';

async function DeckContent({ id }: { id: string }) {
	await syncUser();
	const user = await getUser();

	if (isUUID(id)) {
		const deck = await getDeckById(id, user?.id || '');
		if (deck?.slug) {
			redirect(`/decks/${deck.slug}`, 'permanent' as RedirectType);
		}
		notFound();
	}

	const deck = await getDeck(id);

	if (!deck) {
		notFound();
	}

	const isOwner = user?.id === deck.authorId;

	return <DeckView deck={deck} isOwner={isOwner} />;
}

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Wrap data fetching in Suspense for Partial Prerendering compatibility
	return (
		<Suspense fallback={<PageSkeleton />}>
			<DeckContent id={id} />
		</Suspense>
	);
}
