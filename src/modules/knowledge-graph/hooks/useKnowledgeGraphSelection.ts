'use client';
import { useMemo, useState } from 'react';

import type { KnowledgeGraphNode } from '../types';

type SelectionState = {
	selectedNodeId: string | null;
	setSelectedNodeId: (nodeId: string | null) => void;
	selectedNode: KnowledgeGraphNode | null;
};

export function useKnowledgeGraphSelection(nodes: KnowledgeGraphNode[]): SelectionState {
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	const selectedNode = useMemo(() => {
		if (!selectedNodeId) return null;
		return nodes.find((node) => node.id === selectedNodeId) ?? null;
	}, [nodes, selectedNodeId]);

	return { selectedNodeId, setSelectedNodeId, selectedNode };
}
