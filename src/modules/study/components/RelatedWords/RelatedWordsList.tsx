'use client';

import { Card, Space, Tag, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

import type { RelatedWord } from '../../types/related-words';

const { Text } = Typography;

interface RelatedWordsListProps {
	words: RelatedWord[];
	onSelect: (word: RelatedWord) => void;
	variant?: 'sidebar' | 'sheet' | 'default';
}

export function RelatedWordsList({ words, onSelect, variant = 'default' }: RelatedWordsListProps) {
	if (words.length === 0) return null;

	// Variant-specific styles
	const cardStyles: React.CSSProperties =
		variant === 'sidebar'
			? {
					cursor: 'pointer',
					width: '100%',
					maxWidth: '100%',
					// Ensure card fits within 320px sidebar (accounting for padding)
					boxSizing: 'border-box',
				}
			: {
					cursor: 'pointer',
				};

	const textStyles: React.CSSProperties =
		variant === 'sidebar'
			? {
					fontSize: 14, // Slightly smaller for sidebar
					wordBreak: 'break-word' as const,
					overflowWrap: 'break-word' as const,
				}
			: {
					fontSize: 16,
				};

	return (
		<Space direction="vertical" size="small" style={{ width: '100%' }}>
			{words.map((relatedWord) => (
				<Card
					key={relatedWord.vocab.id}
					size="small"
					hoverable
					onClick={() => onSelect(relatedWord)}
					style={cardStyles}
					styles={{
						body: variant === 'sidebar' ? { padding: '12px' } : undefined, // Compact padding for sidebar
					}}
				>
					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<Space wrap style={{ width: '100%' }}>
							<Text strong style={textStyles}>
								{relatedWord.vocab.wordSurface}
							</Text>
							{relatedWord.vocab.wordReading && (
								<Text
									type="secondary"
									style={{
										fontSize: variant === 'sidebar' ? 12 : 14,
										wordBreak: 'break-word' as const,
									}}
								>
									{relatedWord.vocab.wordReading}
								</Text>
							)}
						</Space>
						{relatedWord.vocab.meanings && (
							<Text
								type="secondary"
								style={{
									fontSize: variant === 'sidebar' ? 12 : 13,
									wordBreak: 'break-word' as const,
									overflowWrap: 'break-word' as const,
									lineHeight: 1.4,
								}}
							>
								{Array.isArray(relatedWord.vocab.meanings.en)
									? relatedWord.vocab.meanings.en[0]
									: Array.isArray(relatedWord.vocab.meanings.vi)
										? relatedWord.vocab.meanings.vi[0]
										: ''}
							</Text>
						)}
						<Space size="small" wrap style={{ width: '100%' }}>
							{relatedWord.relationshipTypes.map((relType, idx) => (
								<RelationshipTag key={idx} relationshipType={relType} variant={variant} />
							))}
						</Space>
					</Space>
				</Card>
			))}
		</Space>
	);
}

function RelationshipTag({
	relationshipType,
	variant,
}: {
	relationshipType: RelatedWord['relationshipTypes'][0];
	variant?: 'sidebar' | 'sheet' | 'default';
}) {
	const t = useTranslations('Study.RelatedWords');

	const tagStyle: React.CSSProperties =
		variant === 'sidebar'
			? {
					fontSize: 11,
					padding: '2px 6px',
					margin: 0,
					lineHeight: 1.2,
				}
			: {};

	if (relationshipType.kind === 'confusion') {
		const confusionTypeLabels: Record<string, string> = {
			HOMONYM: t('confusionHomonym'),
			LOOKALIKE: t('confusionLookalike'),
			SYNONYM: t('confusionSynonym'),
			ANTONYM: t('confusionAntonym'),
			GRAMMAR: t('confusionGrammar'),
		};
		return (
			<Tag color="red" style={tagStyle}>
				{t('confusionPrefix')}:{' '}
				{confusionTypeLabels[relationshipType.confusionType] || relationshipType.confusionType}
			</Tag>
		);
	}

	if (relationshipType.kind === 'shared_kanji') {
		return (
			<Tag color="blue" style={tagStyle}>
				{t('sharedKanji')}
			</Tag>
		);
	}

	if (relationshipType.kind === 'same_deck') {
		return (
			<Tag color="green" style={tagStyle}>
				{t('sameDeck')}
			</Tag>
		);
	}

	if (relationshipType.kind === 'shared_han_viet') {
		return (
			<Tag color="purple" style={tagStyle}>
				{t('sharedHanViet')}
			</Tag>
		);
	}

	return null;
}
