export type KnowledgeGraphEdgeType = 'SHARED_KANJI';

export type KnowledgeGraphNode = {
	id: string;
	vocabularyId: string;
	word: string;
	reading: string;
	meaning: string;
	sharedKanji: string[];
	weight: number;
};

export type KnowledgeGraphEdge = {
	id: string;
	sourceId: string;
	targetId: string;
	edgeType: KnowledgeGraphEdgeType;
	sharedKanji: string[];
	weight: number;
};

export type KnowledgeGraphPayload = {
	centerNodeId: string;
	nodes: KnowledgeGraphNode[];
	edges: KnowledgeGraphEdge[];
	hasMore: boolean;
};
