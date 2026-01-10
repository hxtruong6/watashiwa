'use client';

import { CollapsibleSection } from '@/modules/shared/components/CollapsibleSection';
import { RelatedWordsList } from '@/modules/study/components/RelatedWords/RelatedWordsList';
import { useStudyPreferences } from '@/modules/study/store/useStudyPreferences';
import type { RelatedWord } from '@/modules/study/types/related-words';
import { BranchesOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { Divider, Flex, Typography, theme } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';

/**
 * Placeholder component for Easily Confused words section
 * TODO: Replace with actual confusions data integration
 * @param vocabId - Vocabulary ID (currently unused, will be used for data fetching)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ConfusionsSection = ({ vocabId }: { vocabId: string }) => (
	<div style={{ padding: '8px 0', color: '#999', fontSize: 13, fontStyle: 'italic' }}>
		No easily confused words found.
	</div>
);

/**
 * Placeholder component for Etymology section
 * TODO: Replace with actual etymology data integration
 * @param vocabId - Vocabulary ID (currently unused, will be used for data fetching)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EtymologySection = ({ vocabId }: { vocabId: string }) => (
	<div style={{ padding: '8px 0', color: '#999', fontSize: 13, fontStyle: 'italic' }}>
		Etymology data coming soon.
	</div>
);

interface StudySidebarProps {
	/** Controls sidebar visibility - should be true when answer is revealed (Back Face) */
	visible: boolean;
	/** Array of related words to display */
	relatedWords: RelatedWord[];
	/** Current vocabulary ID - used to fetch confusions/etymology data */
	vocabId: string;
	/** Callback when user selects a related word */
	onSelectRelatedWord: (word: RelatedWord) => void;
}

/**
 * StudySidebar Component
 *
 * Renders a sticky sidebar on desktop (≥768px) that slides in from the right
 * when the flashcard answer is revealed. Displays related words, confusions,
 * and etymology sections based on user preferences.
 *
 * Animation: 300ms ease-out slide-in from right (AC1)
 * Layout: Fixed 320px width, sticky top: 80px (AC4)
 * State: Hidden on Front Face, visible on Back Face (AC2)
 */
export const StudySidebar: React.FC<StudySidebarProps> = ({
	visible,
	relatedWords,
	vocabId,
	onSelectRelatedWord,
}) => {
	const { token } = theme.useToken();
	const { cardBackSettings } = useStudyPreferences();
	const { showConfusions, showEtymology } = cardBackSettings;

	return (
		<motion.aside
			aria-label="Related information"
			initial={{ x: '100%', opacity: 0 }}
			animate={{
				x: visible ? 0 : '100%',
				opacity: visible ? 1 : 0,
			}}
			transition={{ duration: 0.3, ease: 'easeOut' }}
			style={{
				width: 320,
				height: 'calc(100vh - 80px)',
				position: 'sticky', // Changed from sticky to absolute - overlays content instead of taking flex space
				right: 0, // Position from right edge
				top: 80,
				padding: 16,
				borderLeft: `1px solid ${token.colorBorderSecondary}`,
				background: token.colorBgContainer,
				overflowY: 'auto',
				zIndex: 100, // Ensure sidebar is above card content
				// Subtle scrollbar (need to use CSS modules or global styles for proper cross-browser, but inline works for basics)
				scrollbarWidth: 'thin',
				scrollbarColor: `${token.colorBorder} transparent`,
			}}
		>
			{/* Related Words Section */}
			{relatedWords.length > 0 && (
				<Flex vertical gap={12} style={{ marginBottom: 24 }}>
					<Flex align="center" gap={8}>
						<BranchesOutlined style={{ color: token.colorPrimary }} />
						<Typography.Text strong style={{ fontSize: 14 }}>
							Related Words
						</Typography.Text>
					</Flex>
					<RelatedWordsList words={relatedWords} onSelect={onSelectRelatedWord} variant="sidebar" />
				</Flex>
			)}

			<Divider style={{ margin: '16px 0' }} />

			{/* Confusions Section (Collapsible) */}
			{showConfusions && (
				<CollapsibleSection
					title="Easily Confused"
					icon={<WarningOutlined style={{ color: token.colorWarning }} />}
					defaultExpanded={false}
				>
					<ConfusionsSection vocabId={vocabId} />
				</CollapsibleSection>
			)}

			{/* Etymology Section (Collapsible) */}
			{showEtymology && (
				<CollapsibleSection
					title="Word Origins"
					icon={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
					defaultExpanded={false}
				>
					<EtymologySection vocabId={vocabId} />
				</CollapsibleSection>
			)}
		</motion.aside>
	);
};
