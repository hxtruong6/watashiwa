import type { KnowledgeGraphEdge, KnowledgeGraphNode, KnowledgeGraphPayload } from './types';

type BuildMockOptions = {
	centerVocabId?: string;
	limit?: number;
};

const MOCK_NODES: KnowledgeGraphNode[] = [
	{
		id: 'node-1',
		vocabularyId: 'vocab-1',
		word: '学校',
		reading: 'がっこう',
		meaning: 'School',
		sharedKanji: ['学', '校'],
		weight: 0.9,
	},
	{
		id: 'node-2',
		vocabularyId: 'vocab-2',
		word: '学生',
		reading: 'がくせい',
		meaning: 'Student',
		sharedKanji: ['学'],
		weight: 0.75,
	},
	{
		id: 'node-3',
		vocabularyId: 'vocab-3',
		word: '先輩',
		reading: 'せんぱい',
		meaning: 'Senior, upperclassman',
		sharedKanji: ['先'],
		weight: 0.55,
	},
	{
		id: 'node-4',
		vocabularyId: 'vocab-4',
		word: '中学校',
		reading: 'ちゅうがっこう',
		meaning: 'Middle school',
		sharedKanji: ['学', '校', '中'],
		weight: 0.62,
	},
	{
		id: 'node-5',
		vocabularyId: 'vocab-5',
		word: '高校',
		reading: 'こうこう',
		meaning: 'High school',
		sharedKanji: ['校'],
		weight: 0.58,
	},
	{
		id: 'node-6',
		vocabularyId: 'vocab-6',
		word: '先生',
		reading: 'せんせい',
		meaning: 'Teacher',
		sharedKanji: ['先', '生'],
		weight: 0.82,
	},
	{
		id: 'node-7',
		vocabularyId: 'vocab-7',
		word: '勉強',
		reading: 'べんきょう',
		meaning: 'Study',
		sharedKanji: ['勉', '強'],
		weight: 0.44,
	},
];

const MOCK_EDGES: KnowledgeGraphEdge[] = [
	{
		id: 'edge-1',
		sourceId: 'node-1',
		targetId: 'node-2',
		edgeType: 'SHARED_KANJI',
		sharedKanji: ['学'],
		weight: 0.84,
	},
	{
		id: 'edge-2',
		sourceId: 'node-1',
		targetId: 'node-4',
		edgeType: 'SHARED_KANJI',
		sharedKanji: ['学', '校'],
		weight: 0.7,
	},
	{
		id: 'edge-3',
		sourceId: 'node-1',
		targetId: 'node-5',
		edgeType: 'SHARED_KANJI',
		sharedKanji: ['校'],
		weight: 0.64,
	},
	{
		id: 'edge-4',
		sourceId: 'node-2',
		targetId: 'node-6',
		edgeType: 'SHARED_KANJI',
		sharedKanji: ['生'],
		weight: 0.6,
	},
	{
		id: 'edge-5',
		sourceId: 'node-6',
		targetId: 'node-3',
		edgeType: 'SHARED_KANJI',
		sharedKanji: ['先'],
		weight: 0.52,
	},
];

export function buildMockKnowledgeGraph(options: BuildMockOptions = {}): KnowledgeGraphPayload {
	const limit = options.limit ?? 20;
	const nodes = MOCK_NODES.slice(0, limit);
	const nodeIds = new Set(nodes.map((node) => node.id));
	const edges = MOCK_EDGES.filter(
		(edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId),
	);
	const centerNodeId = nodes[0]?.id ?? 'node-1';
	const hasMore = MOCK_NODES.length > nodes.length;

	return {
		centerNodeId,
		nodes,
		edges,
		hasMore,
	};
}
