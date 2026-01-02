import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RedisCache } from './redis-cache';

// Mock ioredis
vi.mock('ioredis', () => {
	const mockRedis = {
		get: vi.fn(),
		setex: vi.fn(),
		del: vi.fn(),
		scanStream: vi.fn(),
		flushdb: vi.fn(),
		info: vi.fn(),
		ping: vi.fn(),
		quit: vi.fn(),
		on: vi.fn(),
		connect: vi.fn(),
	};

	const Redis = vi.fn(() => mockRedis);

	return {
		default: Redis,
	};
});

describe('RedisCache', () => {
	let cache: RedisCache<string>;
	const mockRedis = {
		get: vi.fn(),
		setex: vi.fn(),
		del: vi.fn(),
		scanStream: vi.fn(),
		flushdb: vi.fn(),
		info: vi.fn(),
		ping: vi.fn(),
		quit: vi.fn(),
		on: vi.fn((event, callback) => {
			if (event === 'connect' || event === 'ready') {
				setTimeout(() => callback(), 0);
			}
		}),
		connect: vi.fn().mockResolvedValue(undefined),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock Redis constructor to return our mock
		const Redis = (await import('ioredis')).default;
		vi.mocked(Redis).mockReturnValue(mockRedis as any);
		cache = new RedisCache<string>('redis://localhost:6379');
		// Simulate connection
		cache['isConnected'] = true;
		cache['redis'] = mockRedis as any;
	});

	afterEach(async () => {
		await cache.disconnect();
	});

	describe('get', () => {
		it('should return cached value', async () => {
			mockRedis.get.mockResolvedValue(JSON.stringify('test-value'));

			const result = await cache.get('test-key');

			expect(result).toBe('test-value');
			expect(mockRedis.get).toHaveBeenCalledWith('test-key');
		});

		it('should return null for non-existent key', async () => {
			mockRedis.get.mockResolvedValue(null);

			const result = await cache.get('non-existent');

			expect(result).toBeNull();
		});

		it('should return null on error', async () => {
			mockRedis.get.mockRejectedValue(new Error('Redis error'));

			const result = await cache.get('test-key');

			expect(result).toBeNull();
		});
	});

	describe('set', () => {
		it('should set value with TTL', async () => {
			mockRedis.setex.mockResolvedValue('OK');

			await cache.set('test-key', 'test-value', 3600000);

			expect(mockRedis.setex).toHaveBeenCalledWith(
				'test-key',
				3600, // TTL in seconds
				JSON.stringify('test-value'),
			);
		});

		it('should handle errors gracefully', async () => {
			mockRedis.setex.mockRejectedValue(new Error('Redis error'));

			// Should not throw
			await cache.set('test-key', 'test-value', 3600000);
		});
	});

	describe('delete', () => {
		it('should delete key', async () => {
			mockRedis.del.mockResolvedValue(1);

			await cache.delete('test-key');

			expect(mockRedis.del).toHaveBeenCalledWith('test-key');
		});
	});

	describe('deletePattern', () => {
		it('should delete keys matching pattern', async () => {
			const mockStream = {
				on: vi.fn((event, callback) => {
					if (event === 'data') {
						setTimeout(() => callback(['key1', 'key2']), 0);
					}
					if (event === 'end') {
						setTimeout(() => callback(), 0);
					}
				}),
			};
			mockRedis.scanStream.mockReturnValue(mockStream);
			mockRedis.del.mockResolvedValue(2);

			const deleted = await cache.deletePattern('prefix:*');

			expect(deleted).toBe(2);
		});
	});

	describe('healthCheck', () => {
		it('should return true when Redis is healthy', async () => {
			mockRedis.ping.mockResolvedValue('PONG');

			const healthy = await cache.healthCheck();

			expect(healthy).toBe(true);
		});

		it('should return false when Redis is unhealthy', async () => {
			mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

			const healthy = await cache.healthCheck();

			expect(healthy).toBe(false);
		});
	});
});

