/**
 * Learning Map Module Exports
 *
 * Clean exports for the 2D Learning Map visualization.
 * Shows how users learn/remember words and how words connect to each other.
 */

export { default as LearningMapDemo } from './LearningMapDemo';
export { generateLearningMapDemoData } from './utils/demo-data';
export type {
	LearningMapData,
	LearningMapEdge,
	LearningMapNode,
	LearningMapProps,
	LearningMapVariant,
	LearningTimelinePoint,
} from './types';

// Component exports
export {
	LearningMapHeatmap,
	LearningMapNetwork,
	LearningMapRadial,
	LearningMapTimeline,
} from './components';

