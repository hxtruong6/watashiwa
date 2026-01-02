import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UnifiedCache } from './cache-adapter';
import { RedisCache } from './redis-cache';

// Mock RedisCache
vi.mock('./redis-cache', () => ({
	RedisCache: vi.fn(),
}));

describe('UnifiedCache', () => {
	let cache: UnifiedCache<string>;
	let mockRedisCache: {
		get: ReturnType<typeof vi.fn>;
		set: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		deletePattern: ReturnType<typeof vi.fn>;
		clear: ReturnType<typeof vi.fn>;
		size: ReturnType<typeof vi.fn>;
		healthCheck: ReturnType<typeof vi.fn>;
		isAvailable: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		mockRedisCache = {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			deletePattern: vi.fn(),
			clear: vi.fn(),
			size: vi.fn(),
			healthCheck: vi.fn(),
			isAvailable: vi.fn(),
		};

		vi.mocked(RedisCache).mockImplementation(() => mockRedisCache as unknown as RedisCache<string>);

		cache = new UnifiedCache<string>(3600000, 100000);
		// Fast-forward the setTimeout in constructor
		vi.advanceTimersByTime(1000);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('fallback to memory cache', () => {
		it('should use memory cache when Redis is unavailable', async () => {
			mockRedisCache.isAvailable.mockReturnValue(false);
			mockRedisCache.healthCheck.mockResolvedValue(false);
			// Set cache type directly since health check already ran
			Object.defineProperty(cache, 'cacheType', {
				value: 'memory',
				writable: true,
				configurable: true,
			});

			await cache.set('test-key', 'test-value', 3600000);
			const result = await cache.get('test-key');

			expect(result).toBe('test-value');
			expect(mockRedisCache.set).not.toHaveBeenCalled();
		});

		it('should fallback to memory on Redis error', async () => {
			mockRedisCache.isAvailable.mockReturnValue(true);
			mockRedisCache.get.mockRejectedValue(new Error('Redis error'));
			// Set cache type to redis to trigger Redis path
			Object.defineProperty(cache, 'cacheType', {
				value: 'redis',
				writable: true,
				configurable: true,
			});

			const result = await cache.get('test-key');

			// Should fallback to memory (which will return null for new key)
			expect(result).toBeNull();
			// Should have switched to memory after error
			expect(cache.getCacheType()).toBe('memory');
		});
	});

	describe('Redis and memory dual-write', () => {
		it('should write to both Redis and memory when Redis is available', async () => {
			mockRedisCache.isAvailable.mockReturnValue(true);
			mockRedisCache.set.mockResolvedValue(undefined);
			mockRedisCache.get.mockResolvedValue(null); // Redis returns null, so it falls back to memory
			// Set cache type to redis
			Object.defineProperty(cache, 'cacheType', {
				value: 'redis',
				writable: true,
				configurable: true,
			});

			await cache.set('test-key', 'test-value', 3600000);

			expect(mockRedisCache.set).toHaveBeenCalledWith('test-key', 'test-value', 3600000);
			// Memory cache should also have the value (get will try Redis first, then memory)
			const memoryResult = await cache.get('test-key');
			expect(memoryResult).toBe('test-value');
		});
	});

	describe('getCacheType', () => {
		it('should return current cache type', () => {
			Object.defineProperty(cache, 'cacheType', {
				value: 'redis',
				writable: true,
				configurable: true,
			});
			expect(cache.getCacheType()).toBe('redis');

			Object.defineProperty(cache, 'cacheType', {
				value: 'memory',
				writable: true,
				configurable: true,
			});
			expect(cache.getCacheType()).toBe('memory');
		});
	});

	describe('deletePattern', () => {
		it('should delete from both caches', async () => {
			mockRedisCache.isAvailable.mockReturnValue(true);
			mockRedisCache.deletePattern.mockResolvedValue(2);
			mockRedisCache.set.mockResolvedValue(undefined);
			mockRedisCache.get.mockResolvedValue(null);
			// Set cache type to redis
			Object.defineProperty(cache, 'cacheType', {
				value: 'redis',
				writable: true,
				configurable: true,
			});

			// Set some values in memory cache
			await cache.set('prefix:key1', 'value1');
			await cache.set('prefix:key2', 'value2');
			await cache.set('other:key', 'value3');

			const deleted = await cache.deletePattern('prefix:*');

			expect(deleted).toBeGreaterThan(0);
			expect(mockRedisCache.deletePattern).toHaveBeenCalledWith('prefix:*');
		});
	});
});
