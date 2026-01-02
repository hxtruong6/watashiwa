/**
 * Production-ready in-memory cache with TTL, size limits, and LRU eviction
 * Used for caching relationship queries and sequenced queues
 */

interface CacheEntry<T> {
	data: T;
	expiresAt: number;
	lastAccessed: number; // For LRU eviction
}

interface CacheStats {
	hits: number;
	misses: number;
	evictions: number;
	size: number;
	maxSize: number;
}

export class MemoryCache<T> {
	private cache: Map<string, CacheEntry<T>> = new Map();
	private defaultTtl: number;
	private maxSize: number;
	private stats: CacheStats;
	private cleanupInterval: NodeJS.Timeout | null = null;

	constructor(
		defaultTtlMs: number = 3600000,
		maxSize: number = 10000, // Default: 10k entries
		autoCleanupIntervalMs: number = 60000, // Clean every minute
	) {
		this.defaultTtl = defaultTtlMs;
		this.maxSize = maxSize;
		this.stats = {
			hits: 0,
			misses: 0,
			evictions: 0,
			size: 0,
			maxSize,
		};

		// Automatic cleanup of expired entries
		if (autoCleanupIntervalMs > 0) {
			this.cleanupInterval = setInterval(() => {
				this.cleanExpired();
			}, autoCleanupIntervalMs);
		}
	}

	/**
	 * Get value from cache (updates LRU timestamp)
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) {
			this.stats.misses++;
			return null;
		}

		// Check if expired
		const now = Date.now();
		if (now > entry.expiresAt) {
			this.cache.delete(key);
			this.stats.misses++;
			this.stats.size--;
			return null;
		}

		// Update last accessed for LRU
		entry.lastAccessed = now;
		this.stats.hits++;
		return entry.data;
	}

	/**
	 * Set value in cache with TTL and LRU eviction
	 */
	set(key: string, value: T, ttlMs?: number): void {
		const ttl = ttlMs ?? this.defaultTtl;
		const expiresAt = Date.now() + ttl;
		const now = Date.now();

		// Evict if at capacity (LRU)
		if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
			this.evictLRU();
		}

		// Update or create entry
		const existing = this.cache.get(key);
		if (existing) {
			existing.data = value;
			existing.expiresAt = expiresAt;
			existing.lastAccessed = now;
		} else {
			this.cache.set(key, {
				data: value,
				expiresAt,
				lastAccessed: now,
			});
			this.stats.size++;
		}
	}

	/**
	 * Evict least recently used entry
	 */
	private evictLRU(): void {
		if (this.cache.size === 0) return;

		let lruKey: string | null = null;
		let lruTime = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.lastAccessed < lruTime) {
				lruTime = entry.lastAccessed;
				lruKey = key;
			}
		}

		if (lruKey) {
			this.cache.delete(lruKey);
			this.stats.evictions++;
			this.stats.size--;
		}
	}

	/**
	 * Clean expired entries (more efficient batch operation)
	 */
	cleanExpired(): number {
		const now = Date.now();
		let cleaned = 0;
		const keysToDelete: string[] = [];

		// Collect expired keys first (avoid modifying map during iteration)
		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiresAt) {
				keysToDelete.push(key);
			}
		}

		// Delete in batch
		for (const key of keysToDelete) {
			this.cache.delete(key);
			cleaned++;
		}

		this.stats.size -= cleaned;
		return cleaned;
	}

	/**
	 * Delete entries matching a pattern (optimized for prefix patterns)
	 */
	deletePattern(pattern: string | RegExp): number {
		let deleted = 0;
		const keysToDelete: string[] = [];

		// Optimize for prefix patterns (common case)
		if (typeof pattern === 'string' && !pattern.includes('*') && !pattern.includes('^')) {
			const prefix = pattern;
			for (const key of this.cache.keys()) {
				if (key.startsWith(prefix)) {
					keysToDelete.push(key);
				}
			}
		} else {
			// Fallback to regex for complex patterns
			const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
			for (const key of this.cache.keys()) {
				if (regex.test(key)) {
					keysToDelete.push(key);
				}
			}
		}

		// Delete in batch
		for (const key of keysToDelete) {
			this.cache.delete(key);
			deleted++;
		}

		this.stats.size -= deleted;
		return deleted;
	}

	/**
	 * Get cache statistics
	 */
	getStats(): CacheStats & { hitRate: number } {
		const total = this.stats.hits + this.stats.misses;
		return {
			...this.stats,
			hitRate: total > 0 ? this.stats.hits / total : 0,
		};
	}

	/**
	 * Reset statistics
	 */
	resetStats(): void {
		this.stats.hits = 0;
		this.stats.misses = 0;
		this.stats.evictions = 0;
	}

	delete(key: string): void {
		if (this.cache.delete(key)) {
			this.stats.size--;
		}
	}

	clear(): void {
		this.cache.clear();
		this.stats.size = 0;
	}

	size(): number {
		return this.cache.size;
	}

	/**
	 * Cleanup interval on destroy
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.clear();
	}
}
