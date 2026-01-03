'use client';

import type { SmartCard } from '@/modules/flashcard/types';
import { enrollVocabForSessionAction } from '@/modules/study/actions/enrollVocabForSession';
import { useSessionStore } from '@/modules/study/store/useSessionStore';
import type { RelatedWord } from '@/modules/study/types/related-words';
import { Button, Descriptions, Drawer, Space, Tag, Typography, message } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

const { Text, Title } = Typography;

interface RelatedWordDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	relatedWord: RelatedWord | null;
}

/**
 * Drawer showing details of a related word with option to add to session
 */
export function RelatedWordDetailsDrawer({
	open,
	onClose,
	relatedWord,
}: RelatedWordDetailsDrawerProps) {
	const t = useTranslations('Study.RelatedWords');
	const [loading, setLoading] = useState(false);
	const insertCardAfterCurrent = useSessionStore((state) => state.insertCardAfterCurrent);

	if (!relatedWord) {
		return null;
	}

	const vocab = relatedWord.vocab;

	const handleAddToSession = async () => {
		setLoading(true);
		try {
			const result = await enrollVocabForSessionAction({ vocabId: vocab.id });
			if (result.success && result.data) {
				const card = result.data as SmartCard;
				insertCardAfterCurrent(card);
				message.success(t('added'));
				onClose();
			} else {
				message.error(result.error || 'Failed to add word to session');
			}
		} catch (error) {
			console.error('[RelatedWordDetailsDrawer] Error adding to session:', error);
			message.error('Failed to add word to session');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer title={t('detailsTitle')} placement="right" onClose={onClose} open={open} width={400}>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				{/* Word Surface & Reading */}
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Title level={3} style={{ margin: 0 }}>
						{vocab.wordSurface}
					</Title>
					{vocab.wordReading && (
						<Text type="secondary" style={{ fontSize: 18 }}>
							{vocab.wordReading}
						</Text>
					)}
				</Space>

				{/* Meanings */}
				{vocab.meanings && (
					<Descriptions column={1} size="small" bordered>
						{vocab.meanings.en &&
							Array.isArray(vocab.meanings.en) &&
							vocab.meanings.en.length > 0 && (
								<Descriptions.Item label="English">
									{vocab.meanings.en.join(', ')}
								</Descriptions.Item>
							)}
						{vocab.meanings.vi &&
							Array.isArray(vocab.meanings.vi) &&
							vocab.meanings.vi.length > 0 && (
								<Descriptions.Item label="Tiếng Việt">
									{vocab.meanings.vi.join(', ')}
								</Descriptions.Item>
							)}
					</Descriptions>
				)}

				{/* Hán Việt */}
				{vocab.hanViet && (
					<Descriptions column={1} size="small" bordered>
						<Descriptions.Item label="Hán Việt">
							<Text strong>{vocab.hanViet}</Text>
						</Descriptions.Item>
					</Descriptions>
				)}

				{/* Examples */}
				{vocab.examples && Array.isArray(vocab.examples) && vocab.examples.length > 0 && (
					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<Text strong>Examples:</Text>
						{vocab.examples.slice(0, 2).map((example, idx) => (
							<Text key={idx} type="secondary" style={{ display: 'block' }}>
								{typeof example === 'string' ? example : example.sentence}
							</Text>
						))}
					</Space>
				)}

				{/* Relationship Types */}
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Text strong>{t('connection')}:</Text>
					<Space size="small" wrap>
						{relatedWord.relationshipTypes.map((relType, idx) => (
							<RelationshipTag key={idx} relationshipType={relType} />
						))}
					</Space>
				</Space>

				{/* Add to Session Button */}
				<Button type="primary" block loading={loading} onClick={handleAddToSession} size="large">
					{t('addToSession')}
				</Button>
			</Space>
		</Drawer>
	);
}

/**
 * Render relationship type as a colored Tag (reused from RelatedWords)
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
