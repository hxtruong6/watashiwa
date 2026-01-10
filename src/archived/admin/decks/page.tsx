import AdminDeckTable from '@/modules/deck/components/admin/AdminDeckTable';
import { getAdminDecksAction } from '@/modules/deck/deck.admin.actions';
import { deckParamsCache } from '@/modules/deck/deck.params';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { Suspense } from 'react';

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function AdminDecksContent({ searchParams }: PageProps) {
	const {
		page,
		limit: pageSize,
		sort: sortField,
		order: sortOrder,
	} = await deckParamsCache.parse(searchParams);

	const { success, data } = await getAdminDecksAction({
		page,
		perPage: pageSize,
		sortField,
		sortOrder: sortOrder as 'asc' | 'desc',
	});

	if (!success || !data) {
		return <div>Error loading decks.</div>;
	}

	return (
		<div>
			<h2 style={{ marginBottom: 32, fontSize: 30, fontWeight: 'bold', color: '#1f1f1f' }}>
				Deck Management
			</h2>

			<div
				style={{
					background: 'white',
					padding: 24,
					borderRadius: 16,
					boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
				}}
			>
				<AdminDeckTable decks={data.data as any} total={data.total} />
			</div>
		</div>
	);
}

export default async function AdminDecksPage(props: PageProps) {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<AdminDecksContent {...props} />
		</Suspense>
	);
}
