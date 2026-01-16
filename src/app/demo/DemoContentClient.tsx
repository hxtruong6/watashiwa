/**
 * Demo Content Client Component
 *
 * Client-side rendering for the KanjiWord demo page
 */
'use client';

import { KanjiWord } from '@/modules/kanji-word/components/KanjiWord';
import { KanjiWordProvider } from '@/modules/kanji-word/components/KanjiWordProvider';
import { KanjiWordText } from '@/modules/kanji-word/components/KanjiWordText';
import type { Vocabulary } from '@prisma/client';
import { Card, Flex, Space, Typography } from 'antd';
import { useMemo } from 'react';

import { testVocabs } from './page';

const { Title, Paragraph, Text } = Typography;

// Test sentences
const testSentences = [
	'私は学校に行きます。',
	'今日は休みます。',
	'毎朝、私は学校で日本語を勉強します。',
];

interface DemoContentClientProps {
	vocabCacheArray: [string, Vocabulary][];
}

export function DemoContentClient({ vocabCacheArray }: DemoContentClientProps) {
	// Reconstruct Map from array and add test vocabs for demo
	const vocabCache = useMemo(() => {
		const cache = new Map(vocabCacheArray);

		// Add test vocabs to cache so they're available for auto-detection in sentences
		// This ensures the demo sentences work even if database doesn't have these words
		testVocabs.forEach((vocab) => {
			cache.set(vocab.wordSurface, vocab);
		});

		return cache;
	}, [vocabCacheArray]);

	return (
		<KanjiWordProvider vocabCache={vocabCache} enableAutoDetection={true}>
			<Flex vertical gap="large" style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
				<Title level={1}>KanjiWord Component Demo</Title>

				<Card title="Standalone Words" style={{ width: '100%' }}>
					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						<div>
							<Text strong>Basic Usage:</Text>
							<Paragraph>
								<KanjiWord vocab={testVocabs[0]} />
							</Paragraph>
						</div>

						<div>
							<Text strong>With Furigana:</Text>
							<Paragraph>
								<KanjiWord vocab={testVocabs[0]} readingMode="furigana" />
							</Paragraph>
						</div>

						<div>
							<Text strong>With Romaji:</Text>
							<Paragraph>
								<KanjiWord vocab={testVocabs[0]} readingMode="romaji" />
							</Paragraph>
						</div>

						<div>
							<Text strong>Both Furigana and Romaji:</Text>
							<Paragraph>
								<KanjiWord vocab={testVocabs[0]} readingMode="both" />
							</Paragraph>
						</div>

						<div>
							<Text strong>With JLPT Underline (N5):</Text>
							<Paragraph>
								<KanjiWord
									vocab={testVocabs[0]}
									readingMode="furigana"
									showCategoryUnderline={true}
								/>
							</Paragraph>
						</div>

						<div>
							<Text strong>Different Sizes:</Text>
							<Space direction="vertical">
								<Paragraph>
									Small: <KanjiWord vocab={testVocabs[1]} size="small" />
								</Paragraph>
								<Paragraph>
									Medium: <KanjiWord vocab={testVocabs[1]} size="medium" />
								</Paragraph>
								<Paragraph>
									Large: <KanjiWord vocab={testVocabs[1]} size="large" />
								</Paragraph>
							</Space>
						</div>
					</Space>
				</Card>

				<Card title="Auto-Detection in Sentences" style={{ width: '100%' }}>
					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						{testSentences.map((sentence, idx) => (
							<div key={idx}>
								<Text strong>Sentence {idx + 1}:</Text>
								<Paragraph style={{ fontSize: 18, lineHeight: 1.8 }}>
									<KanjiWordText readingMode="furigana" showCategoryUnderline={true}>
										{sentence}
									</KanjiWordText>
								</Paragraph>
							</div>
						))}
					</Space>
				</Card>

				<Card title="Interactive Features" style={{ width: '100%' }}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						<Text>Hover or tap on any kanji word above to see the tooltip with:</Text>
						<ul>
							<li>Word surface (kanji/kana)</li>
							<li>Reading (furigana/romaji)</li>
							<li>Meanings (English & Vietnamese)</li>
							<li>Hán Việt (if available)</li>
							<li>Audio playback button</li>
							<li>Tags (JLPT level, part of speech, etc.)</li>
							<li>See more details link</li>
						</ul>
					</Space>
				</Card>

				<Card title="Test Words Collection" style={{ width: '100%' }}>
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{testVocabs.map((vocab) => (
							<div key={vocab.id}>
								<KanjiWord
									vocab={vocab}
									readingMode="furigana"
									showCategoryUnderline={true}
									size="medium"
									onClick={(v) => {
										console.log('Clicked vocab:', v?.wordSurface);
									}}
								/>
							</div>
						))}
					</Space>
				</Card>

				<Card title="Notes" style={{ width: '100%' }}>
					<Space direction="vertical" size="small">
						<Text type="secondary">• Hover over kanji words to see tooltip (desktop)</Text>
						<Text type="secondary">• Tap kanji words to see tooltip (mobile/touch)</Text>
						<Text type="secondary">• Click outside tooltip or press ESC to close</Text>
						<Text type="secondary">
							• JLPT level is shown as colored underline (N5=Green, N4=Blue, N3=Orange, N2=Red,
							N1=Purple)
						</Text>
					</Space>
				</Card>
			</Flex>
		</KanjiWordProvider>
	);
}
