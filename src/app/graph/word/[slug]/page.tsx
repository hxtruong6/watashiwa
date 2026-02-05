import { getInitialGraph } from '@/modules/origami/actions';
import { OrigamiCanvas } from '@/modules/origami/components/OrigamiCanvas';
import type { GraphData } from '@/modules/origami/types';
import { redirect } from 'next/navigation';

interface GraphWordPageProps {
	params: Promise<{ slug: string }>;
}

export default async function GraphWordPage({ params }: GraphWordPageProps) {
	const { slug } = await params;

	// Decode the slug (could be kana, romaji, or kanji)
	const word = decodeURIComponent(slug);

	// Fetch graph data
	const result = await getInitialGraph({ word });

	if (!result.success || !result.data) {
		// Redirect to error page or show error
		redirect('/graph?error=word_not_found');
	}

	const { nodes, edges } = result.data as GraphData;

	return (
		<div style={{ width: '100%', height: '100vh' }}>
			<OrigamiCanvas initialNodes={nodes} initialEdges={edges} />
		</div>
	);
}
