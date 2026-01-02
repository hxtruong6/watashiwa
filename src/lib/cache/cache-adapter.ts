/**
 * Unified cache adapter that uses Redis if available, falls back to MemoryCache
 * Provides seamless transition between distributed and in-memory caching
 */
import { MemoryCache } from './memory-cache';
import { RedisCache } from './redis-cache';

export interface CacheAdapter<T> {
	get(key: string): Promise<T | null>;
	set(key: string, value: T, ttlMs?: number): Promise<void>;
	delete(key: string): Promise<void>;
	deletePattern(pattern: string | RegExp): Promise<number>;
	clear(): Promise<void>;
	size(): Promise<number>;
	healthCheck(): Promise<boolean>;
	isAvailable(): boolean;
}

/**
 * Unified cache that automatically uses Redis if available, falls back to MemoryCache
 */
export class UnifiedCache<T> implements CacheAdapter<T> {
	private redisCache: RedisCache<T>;
	private memoryCache: MemoryCache<T>;
	private cacheType: 'redis' | 'memory' = 'memory';
	private fallbackLogged: boolean = false;

	constructor(
		defaultTtlMs: number = 3600000,
		maxSize: number = 100000, // Increased default for memory fallback
		redisUrl?: string,
	) {
		this.redisCache = new RedisCache<T>(redisUrl);
		this.memoryCache = new MemoryCache<T>(defaultTtlMs, maxSize);

		// Check Redis availability after a short delay (allows connection to establish)
		setTimeout(async () => {
			const isRedisAvailable = await this.redisCache.healthCheck();
			if (isRedisAvailable) {
				this.cacheType = 'redis';
				console.log('[UnifiedCache] Using Redis cache');
			} else {
				this.cacheType = 'memory';
				if (!this.fallbackLogged) {
					console.warn('[UnifiedCache] Redis unavailable, falling back to in-memory cache');
					this.fallbackLogged = true;
				}
			}
		}, 1000);
	}

	/**
	 * Get value from cache (tries Redis first, falls back to memory)
	 */
	async get(key: string): Promise<T | null> {
		// Try Redis first if available
		if (this.cacheType === 'redis' && this.redisCache.isAvailable()) {
			try {
				const value = await this.redisCache.get(key);
				if (value !== null) {
					return value;
				}
			} catch (error) {
				// Redis error, fallback to memory
				console.warn('[UnifiedCache] Redis get failed, using memory cache:', error);
				this.cacheType = 'memory';
			}
		}

		// Fallback to memory cache
		return this.memoryCache.get(key);
	}

	/**
	 * Set value in cache (writes to both Redis and memory for redundancy)
	 */
	async set(key: string, value: T, ttlMs?: number): Promise<void> {
		// Always write to memory cache (fast, local)
		this.memoryCache.set(key, value, ttlMs);

		// Also write to Redis if available
		if (this.cacheType === 'redis' && this.redisCache.isAvailable()) {
			try {
				const ttl = ttlMs ?? this.memoryCache['defaultTtl']; // Access private field for default TTL
				await this.redisCache.set(key, value, ttl);
			} catch (error) {
				// Redis error, continue with memory only
				console.warn('[UnifiedCache] Redis set failed, using memory cache only:', error);
				if (this.cacheType === 'redis') {
					this.cacheType = 'memory';
				}
			}
		}
	}

	/**
	 * Delete a specific key
	 */
	async delete(key: string): Promise<void> {
		// Delete from both caches
		this.memoryCache.delete(key);
		if (this.redisCache.isAvailable()) {
			await this.redisCache.delete(key);
		}
	}

	/**
	 * Delete entries matching a pattern
	 */
	async deletePattern(pattern: string | RegExp): Promise<number> {
		let deleted = 0;

		// Delete from memory cache
		deleted += this.memoryCache.deletePattern(pattern);

		// Delete from Redis if available
		if (this.redisCache.isAvailable()) {
			try {
				const redisDeleted = await this.redisCache.deletePattern(pattern);
				deleted = Math.max(deleted, redisDeleted); // Use max since they might have different keys
			} catch (error) {
				console.warn('[UnifiedCache] Redis deletePattern failed:', error);
			}
		}

		return deleted;
	}

	/**
	 * Clear all cache entries
	 */
	async clear(): Promise<void> {
		this.memoryCache.clear();
		if (this.redisCache.isAvailable()) {
			await this.redisCache.clear();
		}
	}

	/**
	 * Get cache size
	 */
	async size(): Promise<number> {
		if (this.cacheType === 'redis' && this.redisCache.isAvailable()) {
			try {
				return await this.redisCache.size();
			} catch (error) {
				// Fallback to memory size
			}
		}
		return this.memoryCache.size();
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		if (this.cacheType === 'redis') {
			const redisHealthy = await this.redisCache.healthCheck();
			if (redisHealthy) {
				return true;
			}
			// Redis unhealthy, switch to memory
			this.cacheType = 'memory';
		}
		// Memory cache is always available
		return true;
	}

	/**
	 * Check if cache is available
	 */
	isAvailable(): boolean {
		if (this.cacheType === 'redis') {
			return this.redisCache.isAvailable();
		}
		return true; // Memory cache is always available
	}

	/**
	 * Get current cache type
	 */
	getCacheType(): 'redis' | 'memory' {
		return this.cacheType;
	}

	/**
	 * Get cache statistics (memory cache only for now)
	 */
	getStats() {
		return {
			type: this.cacheType,
			memory: this.memoryCache.getStats(),
		};
	}
}
