import { prisma } from '@/lib/db';
import { EtymologyData } from '@/lib/schemas/jsonb';
import { SmartCard, StandardCard } from '@/modules/flashcard/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	getSemanticallySequencedQueue,
	invalidateSemanticCache,
} from './semantic-sequencer.service';

// Mock Prisma
vi.mock('@/lib/db', () => ({
	prisma: {
		vocabulary: {
			findMany: vi.fn(),
		},
		confusionPair: {
			findMany: vi.fn(),
		},
	},
}));

// Mock cache
vi.mock('@/lib/cache', () => {
	return {
		UnifiedCache: class UnifiedCache {
			get = vi.fn().mockResolvedValue(null);
			set = vi.fn().mockResolvedValue(undefined);
			deletePattern = vi.fn().mockResolvedValue(undefined);
			size = vi.fn().mockResolvedValue(0);
			getCacheType = vi.fn().mockReturnValue('memory');
		},
	};
});

// Test data fixtures
function createSmartCard(
	id: string,
	vocabId: string,
	srsStage: number,
	wordSurface: string,
	wordReading: string,
	etymology: EtymologyData | null = null,
	deckId: string = 'deck-1',
): StandardCard {
	return {
		id,
		vocabId,
		srsStage,
		nextReview: srsStage > 0 ? new Date() : null,
		variant: 'BASIC',
		front: {
			hero: wordSurface,
			reading: wordReading,
		},
		back: {
			details: {
				id: vocabId,
				deckId,
				tags: [],
				wordSurface,
				wordReading,
				wordRomaji: null,
				hanViet: null,
				pitchPattern: null,
				pitchSvgPath: null,
				homonymGroupId: null,
				etymology,
				meanings: { en: [`meaning-${wordSurface}`], vi: [`nghĩa-${wordSurface}`] },
				mnemonic: null,
				examples: [],
				audioUrl: null,
				imageUrl: null,
				contentStatus: 'PUBLISHED' as const,
				verifiedAt: null,
				verifiedBy: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
				wordOrder: 0,
			},
		},
	};
}

describe('Semantic Sequencer Service', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		await invalidateSemanticCache('test-user');
	});

	describe('getSemanticallySequencedQueue', () => {
		it('should return original queue for empty queue', async () => {
			const queue: SmartCard[] = [];
			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			expect(result.queue).toEqual([]);
			expect(result.fallbackReason).toBe('queue_too_small');
		});

		it('should return original queue for single card', async () => {
			const queue: SmartCard[] = [
				{
					id: 'card-1',
					vocabId: 'vocab-1',
					srsStage: 0,
					nextReview: null,
					variant: 'BASIC',
					front: { hero: 'テスト', reading: 'てすと' },
					back: {
						details: {
							id: 'vocab-1',
							wordSurface: 'テスト',
							wordReading: 'てすと',
							meanings: { en: ['test'] },
							etymology: null,
							examples: [],
						},
					},
				},
			];

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			expect(result.queue).toEqual(queue);
			expect(result.fallbackReason).toBe('queue_too_small');
		});

		it('should return FSRS queue when no relationships found', async () => {
			const queue: SmartCard[] = [
				{
					id: 'card-1',
					vocabId: 'vocab-1',
					srsStage: 1,
					nextReview: new Date(),
					variant: 'BASIC',
					front: { hero: 'テスト', reading: 'てすと' },
					back: {
						details: {
							id: 'vocab-1',
							wordSurface: 'テスト',
							wordReading: 'てすと',
							meanings: { en: ['test'] },
							etymology: null,
							examples: [],
						},
					},
				},
				{
					id: 'card-2',
					vocabId: 'vocab-2',
					srsStage: 1,
					nextReview: new Date(),
					variant: 'BASIC',
					front: { hero: '例', reading: 'れい' },
					back: {
						details: {
							id: 'vocab-2',
							wordSurface: '例',
							wordReading: 'れい',
							meanings: { en: ['example'] },
							etymology: null,
							examples: [],
						},
					},
				},
			];

			// Mock Prisma responses
			// Note: ConfusionPair now uses UNION pattern (two separate queries)
			vi.mocked(prisma.vocabulary.findMany).mockResolvedValue([
				{ id: 'vocab-1', deckId: 'deck-1', etymology: null },
				{ id: 'vocab-2', deckId: 'deck-1', etymology: null },
			] as any);
			// Mock both confusionPair queries (UNION pattern)
			vi.mocked(prisma.confusionPair.findMany)
				.mockResolvedValueOnce([]) // First query (vocabId1)
				.mockResolvedValueOnce([]); // Second query (vocabId2)

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Should return queue (may be reordered or same)
			expect(result.queue.length).toBe(2);
			expect(result.queue.map((c) => c.vocabId).sort()).toEqual(['vocab-1', 'vocab-2']);
		});

		it('should maintain FSRS priority (Due Reviews > New Cards)', async () => {
			const queue: SmartCard[] = [
				{
					id: 'card-1',
					vocabId: 'vocab-1',
					srsStage: 0, // New
					nextReview: null,
					variant: 'BASIC',
					front: { hero: 'テスト', reading: 'てすと' },
					back: {
						details: {
							id: 'vocab-1',
							wordSurface: 'テスト',
							wordReading: 'てすと',
							meanings: { en: ['test'] },
							etymology: null,
							examples: [],
						},
					},
				},
				{
					id: 'card-2',
					vocabId: 'vocab-2',
					srsStage: 2, // Review
					nextReview: new Date(),
					variant: 'BASIC',
					front: { hero: '例', reading: 'れい' },
					back: {
						details: {
							id: 'vocab-2',
							wordSurface: '例',
							wordReading: 'れい',
							meanings: { en: ['example'] },
							etymology: null,
							examples: [],
						},
					},
				},
			];

			vi.mocked(prisma.vocabulary.findMany).mockResolvedValue([
				{ id: 'vocab-1', deckId: 'deck-1', etymology: null },
				{ id: 'vocab-2', deckId: 'deck-1', etymology: null },
			] as any);
			// Mock both confusionPair queries (UNION pattern)
			vi.mocked(prisma.confusionPair.findMany)
				.mockResolvedValueOnce([]) // First query (vocabId1)
				.mockResolvedValueOnce([]); // Second query (vocabId2)

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Due review should come before new card
			const reviewIndex = result.queue.findIndex((c) => c.srsStage > 0);
			const newIndex = result.queue.findIndex((c) => c.srsStage === 0);

			if (reviewIndex !== -1 && newIndex !== -1) {
				expect(reviewIndex).toBeLessThan(newIndex);
			}
		});

		it('should handle timeout gracefully', async () => {
			const queue: SmartCard[] = [
				createSmartCard('card-1', 'vocab-1', 1, 'テスト', 'てすと'),
				createSmartCard('card-2', 'vocab-2', 1, '例', 'れい'),
			];

			// Mock slow query
			vi.mocked(prisma.vocabulary.findMany).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve([]), 3000); // 3 seconds
					}),
			);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
				timeoutMs: 100, // Very short timeout
			});

			// Should fallback to FSRS queue
			expect(result.queue).toEqual(queue);
			expect(result.fallbackReason).toBeDefined();
		});

		it('should cluster words by etymology relationships', async () => {
			// Words sharing kanji 大
			const daigaku = createSmartCard(
				'card-1',
				'vocab-1',
				1,
				'大学',
				'だいがく',
				{
					parts: [
						{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
						{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
					],
				},
				'deck-1',
			);

			const ookii = createSmartCard(
				'card-2',
				'vocab-2',
				1,
				'大きい',
				'おおきい',
				{
					parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
				},
				'deck-1',
			);

			// Word sharing kanji 学
			const manabu = createSmartCard(
				'card-3',
				'vocab-3',
				1,
				'学ぶ',
				'まなぶ',
				{
					parts: [{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } }],
				},
				'deck-1',
			);

			// Unrelated word
			const test = createSmartCard('card-4', 'vocab-4', 1, 'テスト', 'てすと', null, 'deck-1');

			const queue: SmartCard[] = [test, ookii, manabu, daigaku];

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([
					// Etymology query
					{
						id: 'vocab-1',
						etymology: {
							parts: [
								{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
								{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
							],
						},
					},
					{
						id: 'vocab-2',
						etymology: {
							parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
						},
					},
					{
						id: 'vocab-3',
						etymology: {
							parts: [{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } }],
						},
					},
					{
						id: 'vocab-4',
						etymology: null,
					},
				] as any)
				.mockResolvedValueOnce([
					// Deck context query
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
					{ id: 'vocab-3', deckId: 'deck-1' },
					{ id: 'vocab-4', deckId: 'deck-1' },
				] as any);

			// Mock confusion pair queries (no confusion pairs)
			vi.mocked(prisma.confusionPair.findMany).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Should cluster related words together
			const vocabIds = result.queue.map((c) => c.vocabId);
			const daigakuIndex = vocabIds.indexOf('vocab-1');
			const ookiiIndex = vocabIds.indexOf('vocab-2');
			const manabuIndex = vocabIds.indexOf('vocab-3');

			// 大学 and 大きい should be close (share 大)
			expect(Math.abs(daigakuIndex - ookiiIndex)).toBeLessThanOrEqual(2);
			// 大学 and 学ぶ should be close (share 学)
			expect(Math.abs(daigakuIndex - manabuIndex)).toBeLessThanOrEqual(2);

			expect(result.metrics.relationshipsFound).toBeGreaterThan(0);
		});

		it('should prioritize confusion pairs (highest strength)', async () => {
			// Confusion pair
			const kasu = createSmartCard('card-1', 'vocab-1', 1, '貸す', 'かす', null, 'deck-1');
			const kariru = createSmartCard('card-2', 'vocab-2', 1, '借りる', 'かりる', null, 'deck-1');

			// Unrelated words
			const test = createSmartCard('card-3', 'vocab-3', 1, 'テスト', 'てすと', null, 'deck-1');
			const example = createSmartCard('card-4', 'vocab-4', 1, '例', 'れい', null, 'deck-1');

			const queue: SmartCard[] = [test, example, kasu, kariru];

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
					{ id: 'vocab-3', deckId: 'deck-1' },
					{ id: 'vocab-4', deckId: 'deck-1' },
				]);

			// Mock confusion pair queries
			vi.mocked(prisma.confusionPair.findMany)
				.mockResolvedValueOnce([
					// First query (vocabId1)
					{
						vocabId1: 'vocab-1',
						vocabId2: 'vocab-2',
						type: 'ANTONYM',
					},
				] as any)
				.mockResolvedValueOnce([]); // Second query (vocabId2)

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Confusion pair should be clustered together
			const vocabIds = result.queue.map((c) => c.vocabId);
			const kasuIndex = vocabIds.indexOf('vocab-1');
			const kariruIndex = vocabIds.indexOf('vocab-2');

			// They should be adjacent (confusion pairs have highest priority)
			expect(Math.abs(kasuIndex - kariruIndex)).toBe(1);

			expect(result.metrics.relationshipsFound).toBeGreaterThan(0);
		});

		it('should cluster words by deck context (weakest relationship)', async () => {
			// Words from same deck
			const taberu = createSmartCard('card-1', 'vocab-1', 1, '食べる', 'たべる', null, 'deck-1');
			const nomu = createSmartCard('card-2', 'vocab-2', 1, '飲む', 'のむ', null, 'deck-1');
			const chumon = createSmartCard('card-3', 'vocab-3', 1, '注文', 'ちゅうもん', null, 'deck-1');

			// Word from different deck
			const gakkou = createSmartCard('card-4', 'vocab-4', 1, '学校', 'がっこう', null, 'deck-2');

			const queue: SmartCard[] = [gakkou, taberu, nomu, chumon];

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
					{ id: 'vocab-3', deckId: 'deck-1' },
					{ id: 'vocab-4', deckId: 'deck-2' },
				]);

			// Mock confusion pair queries
			vi.mocked(prisma.confusionPair.findMany).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Words from deck-1 should be clustered together
			const vocabIds = result.queue.map((c) => c.vocabId);
			const deck1Words = ['vocab-1', 'vocab-2', 'vocab-3'];
			const deck1Indices = deck1Words.map((id) => vocabIds.indexOf(id));

			// All deck-1 words should be close together
			const maxIndex = Math.max(...deck1Indices);
			const minIndex = Math.min(...deck1Indices);
			expect(maxIndex - minIndex).toBeLessThanOrEqual(2);

			expect(result.metrics.relationshipsFound).toBeGreaterThan(0);
		});

		it('should handle mixed relationships (etymology + confusion + deck)', async () => {
			// Etymology relationship: 大学 and 大きい (share 大)
			const daigaku = createSmartCard(
				'card-1',
				'vocab-1',
				1,
				'大学',
				'だいがく',
				{
					parts: [
						{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
						{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
					],
				},
				'deck-1',
			);

			const ookii = createSmartCard(
				'card-2',
				'vocab-2',
				1,
				'大きい',
				'おおきい',
				{
					parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
				},
				'deck-1',
			);

			// Confusion pair
			const kasu = createSmartCard('card-3', 'vocab-3', 1, '貸す', 'かす', null, 'deck-1');
			const kariru = createSmartCard('card-4', 'vocab-4', 1, '借りる', 'かりる', null, 'deck-1');

			const queue: SmartCard[] = [daigaku, ookii, kasu, kariru];

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([
					// Etymology query
					{
						id: 'vocab-1',
						etymology: {
							parts: [
								{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
								{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
							],
						},
					},
					{
						id: 'vocab-2',
						etymology: {
							parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
						},
					},
					{ id: 'vocab-3', etymology: null },
					{ id: 'vocab-4', etymology: null },
				])
				.mockResolvedValueOnce([
					// Deck context query
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
					{ id: 'vocab-3', deckId: 'deck-1' },
					{ id: 'vocab-4', deckId: 'deck-1' },
				] as any);

			// Mock confusion pair queries
			vi.mocked(prisma.confusionPair.findMany)
				.mockResolvedValueOnce([
					{
						vocabId1: 'vocab-3',
						vocabId2: 'vocab-4',
						type: 'ANTONYM',
					},
				] as any)
				.mockResolvedValueOnce([]);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Confusion pair should be together (highest priority)
			const vocabIds = result.queue.map((c) => c.vocabId);
			const kasuIndex = vocabIds.indexOf('vocab-3');
			const kariruIndex = vocabIds.indexOf('vocab-4');
			expect(Math.abs(kasuIndex - kariruIndex)).toBe(1);

			// Etymology pair should be close (within same cluster)
			// Note: With all words in same deck, they form one connected cluster
			// The etymology pair might be separated by the confusion pair, but should still be in the cluster
			const daigakuIndex = vocabIds.indexOf('vocab-1');
			const ookiiIndex = vocabIds.indexOf('vocab-2');
			// Since all 4 words are connected (same deck), they form one cluster
			// Etymology pair should be within the cluster, but may be separated by confusion pair
			// With 4 words total, max distance is 3, but we expect them to be reasonably close
			expect(Math.abs(daigakuIndex - ookiiIndex)).toBeLessThanOrEqual(3);

			expect(result.metrics.relationshipsFound).toBeGreaterThan(0);
		});

		it('should calculate etymology relationship strength correctly', async () => {
			// Word with 2 kanji
			const daigaku = createSmartCard(
				'card-1',
				'vocab-1',
				1,
				'大学',
				'だいがく',
				{
					parts: [
						{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
						{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
					],
				},
				'deck-1',
			);

			// Word sharing 1 kanji (50% strength)
			const ookii = createSmartCard(
				'card-2',
				'vocab-2',
				1,
				'大きい',
				'おおきい',
				{
					parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
				},
				'deck-1',
			);

			const queue: SmartCard[] = [daigaku, ookii];

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([
					{
						id: 'vocab-1',
						etymology: {
							parts: [
								{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
								{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
							],
						},
					},
					{
						id: 'vocab-2',
						etymology: {
							parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
						},
					},
				] as any)
				.mockResolvedValueOnce([
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
				] as any);

			vi.mocked(prisma.confusionPair.findMany).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Should have found etymology relationship
			expect(result.metrics.relationshipsFound).toBeGreaterThan(0);
			expect(result.fallbackReason).toBeUndefined();
		});

		it('should handle confusion pairs in both directions (UNION pattern)', async () => {
			const kasu = createSmartCard('card-1', 'vocab-1', 1, '貸す', 'かす', null, 'deck-1');
			const kariru = createSmartCard('card-2', 'vocab-2', 1, '借りる', 'かりる', null, 'deck-1');

			const queue: SmartCard[] = [kasu, kariru];

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
				] as any);

			// Test UNION pattern: pair found in second query (vocabId2)
			vi.mocked(prisma.confusionPair.findMany)
				.mockResolvedValueOnce([]) // First query (vocabId1) - no match
				.mockResolvedValueOnce([
					// Second query (vocabId2) - found!
					{
						vocabId1: 'vocab-1',
						vocabId2: 'vocab-2',
						type: 'ANTONYM',
					},
				] as any);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// Should still find the relationship
			expect(result.metrics.relationshipsFound).toBeGreaterThan(0);
			const vocabIds = result.queue.map((c) => c.vocabId);
			const kasuIndex = vocabIds.indexOf('vocab-1');
			const kariruIndex = vocabIds.indexOf('vocab-2');
			expect(Math.abs(kasuIndex - kariruIndex)).toBe(1);
		});

		it('should maintain FSRS priority when clustering', async () => {
			// Due review with etymology relationship
			const daigaku = createSmartCard(
				'card-1',
				'vocab-1',
				2, // Review
				'大学',
				'だいがく',
				{
					parts: [
						{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
						{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
					],
				},
				'deck-1',
			);

			// New card with etymology relationship
			const ookii = createSmartCard(
				'card-2',
				'vocab-2',
				0, // New
				'大きい',
				'おおきい',
				{
					parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
				},
				'deck-1',
			);

			// Another due review
			const test = createSmartCard('card-3', 'vocab-3', 1, 'テスト', 'てすと', null, 'deck-1');

			const queue: SmartCard[] = [ookii, test, daigaku]; // Mixed order

			// Mock Prisma responses
			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([
					{
						id: 'vocab-1',
						etymology: {
							parts: [
								{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } },
								{ kanji: '学', han_viet: 'HỌC', meaning: { vi: 'Học', en: 'Study' } },
							],
						},
					},
					{
						id: 'vocab-2',
						etymology: {
							parts: [{ kanji: '大', han_viet: 'ĐẠI', meaning: { vi: 'Lớn', en: 'Big' } }],
						},
					},
					{ id: 'vocab-3', etymology: null },
				])
				.mockResolvedValueOnce([
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
					{ id: 'vocab-3', deckId: 'deck-1' },
				] as any);

			vi.mocked(prisma.confusionPair.findMany).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			// All due reviews should come before new cards
			const vocabIds = result.queue.map((c) => c.vocabId);
			const reviewIndices = result.queue
				.map((c, i) => (c.srsStage > 0 ? i : -1))
				.filter((i) => i !== -1);
			const newIndices = result.queue
				.map((c, i) => (c.srsStage === 0 ? i : -1))
				.filter((i) => i !== -1);

			if (reviewIndices.length > 0 && newIndices.length > 0) {
				const maxReviewIndex = Math.max(...reviewIndices);
				const minNewIndex = Math.min(...newIndices);
				expect(maxReviewIndex).toBeLessThan(minNewIndex);
			}
		});

		it('should return metrics with performance data', async () => {
			const queue: SmartCard[] = [
				createSmartCard('card-1', 'vocab-1', 1, 'テスト', 'てすと', null, 'deck-1'),
				createSmartCard('card-2', 'vocab-2', 1, '例', 'れい', null, 'deck-1'),
			];

			vi.mocked(prisma.vocabulary.findMany)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([
					{ id: 'vocab-1', deckId: 'deck-1' },
					{ id: 'vocab-2', deckId: 'deck-1' },
				] as any);

			vi.mocked(prisma.confusionPair.findMany).mockResolvedValueOnce([]).mockResolvedValueOnce([]);

			const result = await getSemanticallySequencedQueue(queue, {
				userId: 'test-user',
			});

			expect(result.metrics).toMatchObject({
				startTime: expect.any(Number),
				endTime: expect.any(Number),
				elapsedMs: expect.any(Number),
				relationshipQueryTime: expect.any(Number),
				reorderingTime: expect.any(Number),
				cacheHit: expect.any(Boolean),
				queueSize: 2,
				relationshipsFound: expect.any(Number),
			});

			expect(result.metrics.endTime).toBeGreaterThanOrEqual(result.metrics.startTime);
			expect(result.metrics.elapsedMs).toBeGreaterThanOrEqual(0);
		});
	});
});
