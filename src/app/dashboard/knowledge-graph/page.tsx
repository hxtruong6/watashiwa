import { getKnowledgeGraphAction } from '@/modules/knowledge-graph/actions';
import { KnowledgeGraphPageClient } from '@/modules/knowledge-graph/components/KnowledgeGraphPageClient';
import { PageSkeleton } from '@/modules/ui/components/skeletons';
import { connection } from 'next/server';
import { Suspense } from 'react';

async function KnowledgeGraphContent() {
	await connection();
	const response = await getKnowledgeGraphAction({ limit: 20 });
	return <KnowledgeGraphPageClient response={response} />;
}

export default function KnowledgeGraphPage() {
	return (
		<Suspense fallback={<PageSkeleton />}>
			<KnowledgeGraphContent />
		</Suspense>
	);
}
