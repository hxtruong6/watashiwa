/**
 * Redis-based distributed cache implementation
 * Provides shared caching across all Next.js instances
 * Used for caching relationship queries and sequenced queues
 */
import Redis from 'ioredis';

export class RedisCache<T> {
	private redis: Redis | null = null;
	private isConnected: boolean = false;
	private connectionAttempts: number = 0;
	private readonly maxConnectionAttempts = 3;

	constructor(redisUrl?: string) {
		const url = redisUrl || process.env.REDIS_URL;
		if (!url) {
			console.warn('[RedisCache] REDIS_URL not set, Redis cache disabled');
			return;
		}

		try {
			this.redis = new Redis(url, {
				maxRetriesPerRequest: 3,
				retryStrategy: (times) => {
					if (times > this.maxConnectionAttempts) {
						console.error('[RedisCache] Max connection attempts reached, disabling Redis');
						this.isConnected = false;
						return null; // Stop retrying
					}
					const delay = Math.min(times * 200, 2000); // Exponential backoff, max 2s
					return delay;
				},
				connectTimeout: 5000,
				lazyConnect: true,
				enableReadyCheck: true,
			});

			// Connection event handlers
			this.redis.on('connect', () => {
				this.isConnected = true;
				this.connectionAttempts = 0;
				console.log('[RedisCache] Connected to Redis');
			});

			this.redis.on('ready', () => {
				this.isConnected = true;
				console.log('[RedisCache] Redis ready');
			});

			this.redis.on('error', (error) => {
				console.error('[RedisCache] Redis error:', error.message);
				this.isConnected = false;
			});

			this.redis.on('close', () => {
				this.isConnected = false;
				console.warn('[RedisCache] Redis connection closed');
			});

			// Attempt initial connection
			this.redis.connect().catch((error) => {
				console.error('[RedisCache] Failed to connect to Redis:', error.message);
				this.isConnected = false;
			});
		} catch (error) {
			console.error('[RedisCache] Failed to initialize Redis:', error);
			this.redis = null;
			this.isConnected = false;
		}
	}

	/**
	 * Get value from cache
	 */
	async get(key: string): Promise<T | null> {
		if (!this.redis || !this.isConnected) {
			return null;
		}

		try {
			const value = await this.redis.get(key);
			if (!value) {
				return null;
			}

			return JSON.parse(value) as T;
		} catch (error) {
			console.error(`[RedisCache] Error getting key ${key}:`, error);
			return null;
		}
	}

	/**
	 * Set value in cache with TTL
	 */
	async set(key: string, value: T, ttlMs: number): Promise<void> {
		if (!this.redis || !this.isConnected) {
			return;
		}

		try {
			const serialized = JSON.stringify(value);
			const ttlSeconds = Math.ceil(ttlMs / 1000); // Convert ms to seconds
			await this.redis.setex(key, ttlSeconds, serialized);
		} catch (error) {
			console.error(`[RedisCache] Error setting key ${key}:`, error);
		}
	}

	/**
	 * Delete a specific key
	 */
	async delete(key: string): Promise<void> {
		if (!this.redis || !this.isConnected) {
			return;
		}

		try {
			await this.redis.del(key);
		} catch (error) {
			console.error(`[RedisCache] Error deleting key ${key}:`, error);
		}
	}

	/**
	 * Delete entries matching a pattern
	 * Uses SCAN for efficient pattern matching (better than KEYS for production)
	 */
	async deletePattern(pattern: string | RegExp): Promise<number> {
		if (!this.redis || !this.isConnected) {
			return 0;
		}

		try {
			// Convert RegExp to string pattern for Redis
			const redisPattern =
				typeof pattern === 'string'
					? pattern.replace(/\*/g, '*').replace(/\?/g, '?')
					: pattern.source.replace(/\^|\$|\(|\)|\[|\]|\{|\}|\||\\/g, '');

			// Use SCAN instead of KEYS for better performance
			const stream = this.redis.scanStream({
				match: redisPattern,
				count: 100,
			});

			const keysToDelete: string[] = [];
			stream.on('data', (keys: string[]) => {
				keysToDelete.push(...keys);
			});

			await new Promise<void>((resolve, reject) => {
				stream.on('end', resolve);
				stream.on('error', reject);
			});

			if (keysToDelete.length === 0) {
				return 0;
			}

			// Delete in batches to avoid blocking
			const batchSize = 100;
			let deleted = 0;
			for (let i = 0; i < keysToDelete.length; i += batchSize) {
				const batch = keysToDelete.slice(i, i + batchSize);
				const result = await this.redis.del(...batch);
				deleted += result;
			}

			return deleted;
		} catch (error) {
			console.error(`[RedisCache] Error deleting pattern ${pattern}:`, error);
			return 0;
		}
	}

	/**
	 * Clear all cache entries (use with caution)
	 */
	async clear(): Promise<void> {
		if (!this.redis || !this.isConnected) {
			return;
		}

		try {
			await this.redis.flushdb();
		} catch (error) {
			console.error('[RedisCache] Error clearing cache:', error);
		}
	}

	/**
	 * Get cache size (approximate)
	 */
	async size(): Promise<number> {
		if (!this.redis || !this.isConnected) {
			return 0;
		}

		try {
			const info = await this.redis.info('keyspace');
			// Parse INFO output to get key count
			const match = info.match(/keys=(\d+)/);
			return match ? parseInt(match[1], 10) : 0;
		} catch (error) {
			console.error('[RedisCache] Error getting cache size:', error);
			return 0;
		}
	}

	/**
	 * Health check - verify Redis connection
	 */
	async healthCheck(): Promise<boolean> {
		if (!this.redis) {
			return false;
		}

		try {
			const result = await this.redis.ping();
			this.isConnected = result === 'PONG';
			return this.isConnected;
		} catch (error) {
			this.isConnected = false;
			return false;
		}
	}

	/**
	 * Get connection status
	 */
	isAvailable(): boolean {
		return this.isConnected && this.redis !== null;
	}

	/**
	 * Disconnect from Redis
	 */
	async disconnect(): Promise<void> {
		if (this.redis) {
			await this.redis.quit();
			this.redis = null;
			this.isConnected = false;
		}
	}
}
