/**
 * Demo Data Generator for Learning Map
 *
 * Generates realistic demo data showing learning progression over time
 * and word connections for testing without requiring database access.
 */
import type {
	LearningMapData,
	LearningMapEdge,
	LearningMapNode,
	LearningTimelinePoint,
} from '../types';

/**
 * Generate demo learning map data
 *
 * Creates words with:
 * - Temporal progression (learned at different times)
 * - Review history (timeline points)
 * - Connections (etymology, temporal, semantic)
 */
export function generateLearningMapDemoData(): LearningMapData {
	const now = new Date();
	const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

	// Define word groups with shared kanji roots and learning progression
	const wordDefinitions = [
		// 学 group
		{
			surface: '学生',
			meaning: 'student',
			learnedDaysAgo: 85,
			stability: 45,
			lapses: 0,
			reviewCount: 12,
			kanjiRoots: ['学', '生'],
			deckName: 'Education',
		},
		{
			surface: '学校',
			meaning: 'school',
			learnedDaysAgo: 80,
			stability: 38,
			lapses: 1,
			reviewCount: 10,
			kanjiRoots: ['学', '校'],
			deckName: 'Education',
		},
		{
			surface: '大学',
			meaning: 'university',
			learnedDaysAgo: 75,
			stability: 52,
			lapses: 0,
			reviewCount: 15,
			kanjiRoots: ['大', '学'],
			deckName: 'Education',
		},
		{
			surface: '学習',
			meaning: 'learning',
			learnedDaysAgo: 70,
			stability: 28,
			lapses: 2,
			reviewCount: 8,
			kanjiRoots: ['学', '習'],
			deckName: 'Education',
		},
		// 時 group
		{
			surface: '時間',
			meaning: 'time',
			learnedDaysAgo: 82,
			stability: 55,
			lapses: 0,
			reviewCount: 14,
			kanjiRoots: ['時', '間'],
			deckName: 'Time',
		},
		{
			surface: '時計',
			meaning: 'clock',
			learnedDaysAgo: 78,
			stability: 42,
			lapses: 0,
			reviewCount: 11,
			kanjiRoots: ['時', '計'],
			deckName: 'Time',
		},
		{
			surface: '時代',
			meaning: 'era',
			learnedDaysAgo: 65,
			stability: 30,
			lapses: 2,
			reviewCount: 7,
			kanjiRoots: ['時', '代'],
			deckName: 'Time',
		},
		// 食 group
		{
			surface: '食べる',
			meaning: 'to eat',
			learnedDaysAgo: 88,
			stability: 65,
			lapses: 0,
			reviewCount: 18,
			kanjiRoots: ['食'],
			deckName: 'Daily Life',
		},
		{
			surface: '食事',
			meaning: 'meal',
			learnedDaysAgo: 72,
			stability: 48,
			lapses: 0,
			reviewCount: 12,
			kanjiRoots: ['食', '事'],
			deckName: 'Daily Life',
		},
		{
			surface: '食堂',
			meaning: 'dining room',
			learnedDaysAgo: 60,
			stability: 25,
			lapses: 3,
			reviewCount: 6,
			kanjiRoots: ['食', '堂'],
			deckName: 'Daily Life',
		},
		// 読 group
		{
			surface: '読む',
			meaning: 'to read',
			learnedDaysAgo: 86,
			stability: 58,
			lapses: 0,
			reviewCount: 16,
			kanjiRoots: ['読'],
			deckName: 'Activities',
		},
		{
			surface: '読書',
			meaning: 'reading',
			learnedDaysAgo: 68,
			stability: 40,
			lapses: 1,
			reviewCount: 9,
			kanjiRoots: ['読', '書'],
			deckName: 'Activities',
		},
		// 書 group
		{
			surface: '書く',
			meaning: 'to write',
			learnedDaysAgo: 84,
			stability: 62,
			lapses: 0,
			reviewCount: 17,
			kanjiRoots: ['書'],
			deckName: 'Activities',
		},
		{
			surface: '図書館',
			meaning: 'library',
			learnedDaysAgo: 55,
			stability: 33,
			lapses: 2,
			reviewCount: 5,
			kanjiRoots: ['図', '書', '館'],
			deckName: 'Places',
		},
		// 見 group
		{
			surface: '見る',
			meaning: 'to see',
			learnedDaysAgo: 90,
			stability: 70,
			lapses: 0,
			reviewCount: 20,
			kanjiRoots: ['見'],
			deckName: 'Actions',
		},
		{
			surface: '見学',
			meaning: 'observation',
			learnedDaysAgo: 50,
			stability: 22,
			lapses: 3,
			reviewCount: 4,
			kanjiRoots: ['見', '学'],
			deckName: 'Education',
		},
		// 話 group
		{
			surface: '話す',
			meaning: 'to speak',
			learnedDaysAgo: 83,
			stability: 55,
			lapses: 0,
			reviewCount: 13,
			kanjiRoots: ['話'],
			deckName: 'Communication',
		},
		{
			surface: '会話',
			meaning: 'conversation',
			learnedDaysAgo: 58,
			stability: 35,
			lapses: 1,
			reviewCount: 6,
			kanjiRoots: ['会', '話'],
			deckName: 'Communication',
		},
		// 会 group
		{
			surface: '会う',
			meaning: 'to meet',
			learnedDaysAgo: 77,
			stability: 50,
			lapses: 0,
			reviewCount: 11,
			kanjiRoots: ['会'],
			deckName: 'Social',
		},
	];

	// Build nodes with temporal data
	const nodes: LearningMapNode[] = wordDefinitions.map((def, index) => {
		const learnedAt = new Date(startDate.getTime() + def.learnedDaysAgo * 24 * 60 * 60 * 1000);
		const lastReviewAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
		const nextReviewAt = new Date(lastReviewAt.getTime() + def.stability * 24 * 60 * 60 * 1000);

		const srsStage = def.lapses >= 3 ? 3 : def.stability > 21 ? 2 : def.stability > 7 ? 1 : 0;
		const isLeech = def.lapses >= 3 || srsStage === 3;

		return {
			id: `demo-${index + 1}`,
			wordSurface: def.surface,
			meaning: def.meaning,
			learnedAt,
			lastReviewAt,
			nextReviewAt,
			stability: def.stability,
			srsStage,
			lapses: def.lapses,
			reviewCount: def.reviewCount,
			isLeech,
			kanjiRoots: def.kanjiRoots,
			deckName: def.deckName,
		};
	});

	// Build edges (connections)
	const edges: LearningMapEdge[] = [];

	// 1. Etymology connections (shared kanji roots)
	const rootToNodes = new Map<string, LearningMapNode[]>();
	for (const node of nodes) {
		for (const root of node.kanjiRoots) {
			if (!rootToNodes.has(root)) {
				rootToNodes.set(root, []);
			}
			rootToNodes.get(root)!.push(node);
		}
	}

	for (const [root, rootNodes] of rootToNodes.entries()) {
		if (rootNodes.length < 2) continue;

		for (let i = 0; i < rootNodes.length; i++) {
			for (let j = i + 1; j < rootNodes.length; j++) {
				const source = rootNodes[i];
				const target = rootNodes[j];
				const daysApart = Math.abs(
					(source.learnedAt.getTime() - target.learnedAt.getTime()) / (24 * 60 * 60 * 1000),
				);

				edges.push({
					source: source.id,
					target: target.id,
					connectionType: 'etymology',
					strength: 0.8,
					metadata: {
						sharedRoot: root,
						learnedDaysApart: Math.round(daysApart),
					},
				});
			}
		}
	}

	// 2. Temporal connections (learned close together)
	for (let i = 0; i < nodes.length; i++) {
		for (let j = i + 1; j < nodes.length; j++) {
			const source = nodes[i];
			const target = nodes[j];
			const daysApart = Math.abs(
				(source.learnedAt.getTime() - target.learnedAt.getTime()) / (24 * 60 * 60 * 1000),
			);

			// Connect words learned within 5 days of each other
			if (daysApart <= 5 && daysApart > 0) {
				// Check if edge already exists
				const exists = edges.some(
					(e) =>
						(e.source === source.id && e.target === target.id) ||
						(e.source === target.id && e.target === source.id),
				);

				if (!exists) {
					edges.push({
						source: source.id,
						target: target.id,
						connectionType: 'temporal',
						strength: 0.4,
						metadata: {
							learnedDaysApart: Math.round(daysApart),
						},
					});
				}
			}
		}
	}

	// 3. Deck connections (same deck)
	const deckToNodes = new Map<string, LearningMapNode[]>();
	for (const node of nodes) {
		if (node.deckName) {
			if (!deckToNodes.has(node.deckName)) {
				deckToNodes.set(node.deckName, []);
			}
			deckToNodes.get(node.deckName)!.push(node);
		}
	}

	for (const [deck, deckNodes] of deckToNodes.entries()) {
		if (deckNodes.length < 2) continue;

		for (let i = 0; i < deckNodes.length; i++) {
			for (let j = i + 1; j < deckNodes.length; j++) {
				const source = deckNodes[i];
				const target = deckNodes[j];

				// Check if edge already exists
				const exists = edges.some(
					(e) =>
						(e.source === source.id && e.target === target.id) ||
						(e.source === target.id && e.target === source.id),
				);

				if (!exists) {
					edges.push({
						source: source.id,
						target: target.id,
						connectionType: 'deck',
						strength: 0.3,
					});
				}
			}
		}
	}

	// Build timeline data (review history)
	const timeline: LearningTimelinePoint[] = [];
	for (const node of nodes) {
		// Generate review points over time
		const reviewCount = node.reviewCount;
		for (let i = 0; i < reviewCount; i++) {
			const reviewDate = new Date(
				node.learnedAt.getTime() +
					((i + 1) / (reviewCount + 1)) * (node.lastReviewAt.getTime() - node.learnedAt.getTime()),
			);

			// Simulate stability growth
			const progress = (i + 1) / reviewCount;
			const stability = Math.min(node.stability, node.stability * progress * 1.5);

			timeline.push({
				wordId: node.id,
				date: reviewDate,
				stability,
				rating: i === reviewCount - 1 && node.lapses > 0 ? 1 : Math.floor(Math.random() * 2) + 3, // 3 or 4
				duration: Math.floor(Math.random() * 3000) + 1000, // 1-4 seconds
			});
		}
	}

	// Sort timeline by date
	timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

	return {
		nodes,
		edges,
		timeline,
		totalNodes: nodes.length,
		totalEdges: edges.length,
		dateRange: {
			start: startDate,
			end: now,
		},
	};
}
