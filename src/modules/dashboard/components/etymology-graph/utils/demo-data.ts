/**
 * Demo Data Generator for Etymology Graph
 *
 * Generates realistic demo data with shared kanji roots for testing
 * without requiring database access.
 *
 * Example connections:
 * - 学 (study): 学生 (student), 学校 (school), 大学 (university)
 * - 大 (big): 大学 (university), 大きい (big), 大人 (adult)
 * - 時 (time): 時間 (time), 時計 (clock), 時代 (era)
 */

import type { EtymologyGraphData, EtymologyGraphEdge, EtymologyGraphNode } from '../types';

/**
 * Generate demo etymology graph data
 *
 * Creates 20-30 words with realistic shared kanji roots,
 * stability/lapses distribution, and connections.
 */
export function generateEtymologyDemoData(): EtymologyGraphData {
	// Define word groups with shared kanji roots
	const wordGroups: Array<{
		root: string;
		words: Array<{ surface: string; meaning: string; stability: number; lapses: number }>;
	}> = [
		{
			root: '学',
			words: [
				{ surface: '学生', meaning: 'student', stability: 45, lapses: 0 },
				{ surface: '学校', meaning: 'school', stability: 38, lapses: 1 },
				{ surface: '大学', meaning: 'university', stability: 52, lapses: 0 },
				{ surface: '学習', meaning: 'learning', stability: 28, lapses: 2 },
			],
		},
		{
			root: '大',
			words: [
				{ surface: '大学', meaning: 'university', stability: 52, lapses: 0 },
				{ surface: '大きい', meaning: 'big', stability: 60, lapses: 0 },
				{ surface: '大人', meaning: 'adult', stability: 35, lapses: 1 },
			],
		},
		{
			root: '時',
			words: [
				{ surface: '時間', meaning: 'time', stability: 55, lapses: 0 },
				{ surface: '時計', meaning: 'clock', stability: 42, lapses: 0 },
				{ surface: '時代', meaning: 'era', stability: 30, lapses: 2 },
			],
		},
		{
			root: '食',
			words: [
				{ surface: '食べる', meaning: 'to eat', stability: 65, lapses: 0 },
				{ surface: '食事', meaning: 'meal', stability: 48, lapses: 0 },
				{ surface: '食堂', meaning: 'dining room', stability: 25, lapses: 3 },
			],
		},
		{
			root: '読',
			words: [
				{ surface: '読む', meaning: 'to read', stability: 58, lapses: 0 },
				{ surface: '読書', meaning: 'reading', stability: 40, lapses: 1 },
			],
		},
		{
			root: '書',
			words: [
				{ surface: '書く', meaning: 'to write', stability: 62, lapses: 0 },
				{ surface: '読書', meaning: 'reading', stability: 40, lapses: 1 },
				{ surface: '図書館', meaning: 'library', stability: 33, lapses: 2 },
			],
		},
		{
			root: '図',
			words: [
				{ surface: '図書館', meaning: 'library', stability: 33, lapses: 2 },
				{ surface: '図', meaning: 'diagram', stability: 20, lapses: 4 },
			],
		},
		{
			root: '見',
			words: [
				{ surface: '見る', meaning: 'to see', stability: 70, lapses: 0 },
				{ surface: '見学', meaning: 'observation', stability: 22, lapses: 3 },
			],
		},
		{
			root: '話',
			words: [
				{ surface: '話す', meaning: 'to speak', stability: 55, lapses: 0 },
				{ surface: '会話', meaning: 'conversation', stability: 35, lapses: 1 },
			],
		},
		{
			root: '会',
			words: [
				{ surface: '会話', meaning: 'conversation', stability: 35, lapses: 1 },
				{ surface: '会う', meaning: 'to meet', stability: 50, lapses: 0 },
			],
		},
	];

	// Build nodes from word groups
	const nodeMap = new Map<string, EtymologyGraphNode>();
	let nodeIdCounter = 1;

	for (const group of wordGroups) {
		for (const word of group.words) {
			// Use word surface as key to avoid duplicates
			const key = word.surface;
			if (nodeMap.has(key)) {
				// Word already exists, add kanji root to existing node
				const existingNode = nodeMap.get(key)!;
				if (!existingNode.kanjiRoots.includes(group.root)) {
					existingNode.kanjiRoots.push(group.root);
				}
			} else {
				// Create new node
				const srsStage = word.lapses >= 3 ? 3 : word.stability > 21 ? 2 : word.stability > 7 ? 1 : 0;
				const isLeech = word.lapses >= 3 || srsStage === 3;

				nodeMap.set(key, {
					id: `demo-${nodeIdCounter++}`,
					wordSurface: word.surface,
					meaning: word.meaning,
					stability: word.stability,
					srsStage,
					lapses: word.lapses,
					kanjiRoots: [group.root],
					isLeech,
				});
			}
		}
	}

	const nodes = Array.from(nodeMap.values());

	// Build edges from shared kanji roots
	const edges: EtymologyGraphEdge[] = [];
	const rootToNodes = new Map<string, EtymologyGraphNode[]>();

	// Group nodes by kanji root
	for (const node of nodes) {
		for (const root of node.kanjiRoots) {
			if (!rootToNodes.has(root)) {
				rootToNodes.set(root, []);
			}
			rootToNodes.get(root)!.push(node);
		}
	}

	// Create edges for roots with ≥2 nodes
	for (const [root, rootNodes] of rootToNodes.entries()) {
		if (rootNodes.length < 2) {
			continue;
		}

		// Create edges between all pairs
		const seenPairs = new Set<string>();
		for (let i = 0; i < rootNodes.length; i++) {
			for (let j = i + 1; j < rootNodes.length; j++) {
				const source = rootNodes[i].id;
				const target = rootNodes[j].id;

				// Create unique key for pair (order-independent)
				const pairKey = source < target ? `${source}-${target}` : `${target}-${source}`;
				if (seenPairs.has(pairKey)) {
					continue;
				}
				seenPairs.add(pairKey);

				edges.push({
					source,
					target,
					sharedRoot: root,
				});
			}
		}
	}

	return {
		nodes,
		edges,
		totalNodes: nodes.length,
		totalEdges: edges.length,
	};
}

