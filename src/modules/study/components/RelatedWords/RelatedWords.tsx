'use client';

import { Card, Skeleton, Space, Tag, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

import type { RelatedWord } from '../../types/related-words';

const { Text } = Typography;

interface RelatedWordsProps {
	relatedWords: RelatedWord[];
	loading: boolean;
	onSelect: (relatedWord: RelatedWord) => void;
}

/**
 * Display semantically related words with relationship type indicators
 * Shows nothing when empty (graceful degradation per AC3)
 */
export function RelatedWords({ relatedWords, loading, onSelect }: RelatedWordsProps) {
	const t = useTranslations('Study.RelatedWords');

	// Empty state: show nothing (not an error) per AC3
	if (!loading && relatedWords.length === 0) {
		return null;
	}

	// Loading state
	if (loading) {
		return (
			<Space direction="vertical" size="small" style={{ width: '100%', marginTop: 16 }}>
				<Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
					{t('title')}
				</Text>
				<Card size="small">
					<Skeleton active paragraph={{ rows: 1 }} />
				</Card>
			</Space>
		);
	}

	// Render related words list
	return (
		<Space direction="vertical" size="small" style={{ width: '100%', marginTop: 16 }}>
			<Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
				{t('title')}
			</Text>
			<Space direction="vertical" size="small" style={{ width: '100%' }}>
				{relatedWords.map((relatedWord) => (
					<Card
						key={relatedWord.vocab.id}
						size="small"
						hoverable
						onClick={() => onSelect(relatedWord)}
						style={{ cursor: 'pointer' }}
					>
						<Space direction="vertical" size="small" style={{ width: '100%' }}>
							<Space>
								<Text strong style={{ fontSize: 16 }}>
									{relatedWord.vocab.wordSurface}
								</Text>
								{relatedWord.vocab.wordReading && (
									<Text type="secondary" style={{ fontSize: 14 }}>
										{relatedWord.vocab.wordReading}
									</Text>
								)}
							</Space>
							{relatedWord.vocab.meanings && (
								<Text type="secondary" style={{ fontSize: 13 }}>
									{Array.isArray(relatedWord.vocab.meanings.en)
										? relatedWord.vocab.meanings.en[0]
										: Array.isArray(relatedWord.vocab.meanings.vi)
											? relatedWord.vocab.meanings.vi[0]
											: ''}
								</Text>
							)}
							<Space size="small" wrap>
								{relatedWord.relationshipTypes.map((relType, idx) => (
									<RelationshipTag key={idx} relationshipType={relType} />
								))}
							</Space>
						</Space>
					</Card>
				))}
			</Space>
		</Space>
	);
}

/**
 * Render relationship type as a colored Tag
 */
function RelationshipTag({
	relationshipType,
}: {
	relationshipType: RelatedWord['relationshipTypes'][0];
}) {
	const t = useTranslations('Study.RelatedWords');

	if (relationshipType.kind === 'confusion') {
		const confusionTypeLabels: Record<string, string> = {
			HOMONYM: t('confusionHomonym'),
			LOOKALIKE: t('confusionLookalike'),
			SYNONYM: t('confusionSynonym'),
			ANTONYM: t('confusionAntonym'),
			GRAMMAR: t('confusionGrammar'),
		};
		return (
			<Tag color="red">
				{t('confusionPrefix')}:{' '}
				{confusionTypeLabels[relationshipType.confusionType] || relationshipType.confusionType}
			</Tag>
		);
	}

	if (relationshipType.kind === 'shared_kanji') {
		return <Tag color="blue">{t('sharedKanji')}</Tag>;
	}

	if (relationshipType.kind === 'same_deck') {
		return <Tag color="green">{t('sameDeck')}</Tag>;
	}

	if (relationshipType.kind === 'shared_han_viet') {
		return <Tag color="purple">{t('sharedHanViet')}</Tag>;
	}

	return null;
}
