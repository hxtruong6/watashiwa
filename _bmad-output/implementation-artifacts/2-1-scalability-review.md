# Scalability Review: Story 2.1 - Semantic Sequencing for 10K+ Concurrent Users

**Review Date:** 2025-01-XX  
**Reviewer:** Senior Full-Stack Engineer  
**Target Scale:** 10,000+ Concurrent Users  
**Status:** ⚠️ **REQUIRES OPTIMIZATIONS**

---

## Executive Summary

The current implementation has **good foundations** with proper error handling, timeouts, and fallback mechanisms. However, there are **critical scalability bottlenecks** that will prevent it from handling 10K+ concurrent users effectively:

1. **🔴 CRITICAL:** In-memory cache is not distributed (per-instance only)
2. **🟡 HIGH:** Database query patterns need optimization for OR clauses
3. **🟡 HIGH:** Connection pooling configuration not explicit
4. **🟡 MEDIUM:** Cache size limits may be insufficient
5. **🟢 LOW:** Missing composite indexes for specific query patterns

---

## 1. Memory Cache Scalability Issues

### Current Implementation

```29:29:src/lib/cache/memory-cache.ts
  maxSize: number = 10000, // Default: 10k entries
```

### Problems Identified

#### 1.1 Per-Instance Cache (Not Distributed)

- **Issue:** Each Next.js server instance maintains its own in-memory cache
- **Impact:**
  - Cache duplication across instances (wasteful memory)
  - Cache misses when requests hit different instances
  - No shared cache benefits
- **Example:** With 5 instances, each has 10k entries = 50k total entries, but only 20% effective cache hit rate per instance

#### 1.2 Cache Size Limit Too Small

- **Current:** 10,000 entries per instance
- **Problem:** With 10K concurrent users, cache will evict frequently
- **Calculation:**
  - Average user has 50-100 vocabulary items
  - Cache key format: `semantic-relationships:${userId}:${vocabIds.join(',')}`
  - Unique combinations: ~500K-1M possible keys
  - 10k entries = ~1-2% cache coverage

#### 1.3 Cache Key Strategy Creates Many Unique Keys

- **Current Key Format:** `semantic-relationships:${userId}:${vocabIds.sort().join(',')}`
- **Problem:** Each unique queue combination creates a new cache key
- **Impact:** Low cache hit rate, frequent evictions

### Recommendations

1. **🔴 CRITICAL: Implement Redis for Distributed Caching**

   ```typescript
   // Use Redis instead of in-memory cache for production
   import { Redis } from 'ioredis';

   const redis = new Redis(process.env.REDIS_URL);

   // Cache with TTL
   await redis.setex(
   	`semantic-relationships:${userId}:${vocabHash}`,
   	3600, // 1 hour
   	JSON.stringify(relationshipMap),
   );
   ```

2. **🟡 HIGH: Increase Cache Size or Use LRU with Higher Limit**

   ```typescript
   // For in-memory fallback, increase to 100k entries
   const relationshipCache = new MemoryCache<RelationshipMap>(
   	3600000, // 1 hour TTL
   	100000, // 100k entries (was 10k)
   );
   ```

3. **🟡 MEDIUM: Optimize Cache Key Strategy**

   ```typescript
   // Hash vocabIds instead of joining (smaller keys, better distribution)
   import { createHash } from 'crypto';

   const vocabHash = createHash('sha256')
   	.update(vocabIds.sort().join(','))
   	.digest('hex')
   	.substring(0, 16); // 16 char hash

   const cacheKey = `semantic-relationships:${userId}:${vocabHash}`;
   ```

---

## 2. Database Query Optimization

### Current Query Patterns

#### 2.1 ConfusionPair Query (Potential Issue)

```297:306:src/modules/study/services/semantic-sequencer.service.ts
 const confusionPairs = await prisma.confusionPair.findMany({
  where: {
   OR: [{ vocabId1: { in: vocabIds } }, { vocabId2: { in: vocabIds } }],
  },
  select: {
   vocabId1: true,
   vocabId2: true,
   type: true,
  },
 });
```

**Problem:**

- `OR` clause with two separate `IN` conditions may not use indexes efficiently
- PostgreSQL may need to scan both indexes separately
- No composite index covering both vocabId1 and vocabId2

**Current Indexes:**

```316:317:prisma/schema.prisma
  @@index([vocabId1])
  @@index([vocabId2])
```

**Solution:** Add a composite index or use UNION query pattern:

```sql
-- Option 1: Composite index (if both columns are frequently queried together)
CREATE INDEX "ConfusionPair_vocab_id_1_vocab_id_2_idx"
ON "ConfusionPair"("vocab_id_1", "vocab_id_2");

-- Option 2: Use UNION query (more efficient for OR clauses)
SELECT * FROM "ConfusionPair" WHERE vocab_id_1 = ANY($1)
UNION
SELECT * FROM "ConfusionPair" WHERE vocab_id_2 = ANY($1);
```

#### 2.2 Vocabulary Etymology Query (Good)

```212:221:src/modules/study/services/semantic-sequencer.service.ts
 const vocabs = await prisma.vocabulary.findMany({
  where: {
   id: { in: vocabIds },
   etymology: { not: null },
  },
  select: {
   id: true,
   etymology: true,
  },
 });
```

**Status:** ✅ **GOOD** - Uses primary key index, efficient

**Potential Optimization:** Add partial index for etymology queries:

```sql
CREATE INDEX "Vocabulary_etymology_not_null_idx"
ON "Vocabulary"(id)
WHERE etymology IS NOT NULL;
```

#### 2.3 Vocabulary Deck Context Query (Good)

```328:336:src/modules/study/services/semantic-sequencer.service.ts
 const vocabs = await prisma.vocabulary.findMany({
  where: {
   id: { in: vocabIds },
  },
  select: {
   id: true,
   deckId: true,
  },
 });
```

**Status:** ✅ **GOOD** - Uses primary key index

### Recommendations

1. **🟡 HIGH: Optimize ConfusionPair Query**

   ```typescript
   // Use UNION pattern for better index usage
   const [pairs1, pairs2] = await Promise.all([
   	prisma.confusionPair.findMany({
   		where: { vocabId1: { in: vocabIds } },
   		select: { vocabId1: true, vocabId2: true, type: true },
   	}),
   	prisma.confusionPair.findMany({
   		where: { vocabId2: { in: vocabIds } },
   		select: { vocabId1: true, vocabId2: true, type: true },
   	}),
   ]);

   // Deduplicate (a pair might appear in both results)
   const confusionPairs = Array.from(
   	new Map([...pairs1, ...pairs2].map((p) => [`${p.vocabId1}-${p.vocabId2}`, p])).values(),
   );
   ```

2. **🟡 MEDIUM: Add Partial Index for Etymology Queries**

   ```prisma
   // In schema.prisma (requires raw SQL migration)
   // This is a PostgreSQL-specific optimization
   ```

3. **🟢 LOW: Consider Batch Size Limits**

   ```typescript
   // If vocabIds array is very large (>1000), batch the queries
   const BATCH_SIZE = 500;
   const batches = chunk(vocabIds, BATCH_SIZE);
   const results = await Promise.all(
     batches.map(batch => prisma.vocabulary.findMany({...}))
   );
   ```

---

## 3. Connection Pooling Configuration

### Current Implementation

```16:23:src/lib/db.ts
const adapter = new PrismaPg({ connectionString });

const prisma =
 globalForPrisma.prisma ??
 new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
 });
```

### Problems Identified

1. **No Explicit Connection Pool Configuration**
   - Prisma defaults: ~10 connections per instance
   - With 10K concurrent users and 5 instances = 50 total connections
   - **Problem:** This may be insufficient for peak load

2. **DATABASE_URL May Not Include Pool Parameters**
   - Should include: `?connection_limit=20&pool_timeout=10`

### Recommendations

1. **🟡 HIGH: Configure Connection Pool in DATABASE_URL**

   ```env
   # Production DATABASE_URL should include:
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10&connect_timeout=5"
   ```

2. **🟡 MEDIUM: Use Prisma Connection Pooling**

   ```typescript
   const prisma = new PrismaClient({
   	adapter,
   	log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
   	datasources: {
   		db: {
   			url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=10',
   		},
   	},
   });
   ```

3. **🟢 LOW: Monitor Connection Pool Usage**

   ```typescript
   // Add monitoring
   setInterval(async () => {
   	const metrics = await prisma.$metrics.json();
   	console.log('DB Pool:', metrics.counters);
   }, 60000);
   ```

---

## 4. Performance Under Load

### Current Performance Targets

- **Semantic Query:** <200ms (NFR1)
- **Queue Reordering:** <100ms
- **Total Overhead:** <300ms
- **Fallback Threshold:** >500ms triggers fallback

### Load Testing Scenarios

#### Scenario 1: 10K Concurrent Users Starting Sessions

- **Assumption:** 10% of users start session simultaneously (1K requests)
- **Current Behavior:**
  - Each request: 3 DB queries (etymology, confusion, deck)
  - Cache miss rate: ~80% (due to per-instance cache)
  - **Problem:** 1K requests × 3 queries = 3K DB queries in <1 second
  - **Impact:** Database connection pool exhaustion, slow queries

#### Scenario 2: Cache Eviction Under Load

- **Current:** LRU eviction with 10k entry limit
- **Problem:** With high cache miss rate, frequent evictions
- **Impact:** More DB queries, slower response times

### Recommendations

1. **🔴 CRITICAL: Implement Redis Caching**
   - Shared cache across all instances
   - Reduces DB load by 80-90%
   - Better cache hit rates

2. **🟡 HIGH: Add Request Rate Limiting**

   ```typescript
   // Use middleware to rate limit session starts
   import { rateLimit } from '@/lib/rate-limit';

   export async function fetchSessionAction(input) {
   	await rateLimit(input.userId, 'session-start', { max: 10, window: 60000 });
   	// ... rest of implementation
   }
   ```

3. **🟡 MEDIUM: Implement Query Result Caching at DB Level**
   - Use PostgreSQL's `pg_stat_statements` to identify hot queries
   - Consider materialized views for common relationship queries

---

## 5. Missing Optimizations

### 5.1 No Query Result Pagination

- **Current:** Fetches all relationships at once
- **Problem:** Large vocab sets (>100 items) may be slow
- **Solution:** Not needed for current use case (queue is limited to 10-50 items)

### 5.2 No Background Job for Pre-computation

- **Opportunity:** Pre-compute relationships for popular vocabulary sets
- **Benefit:** Faster response times, better cache hit rates

### 5.3 No Circuit Breaker Pattern

- **Current:** Timeout-based fallback
- **Enhancement:** Add circuit breaker to prevent cascading failures

  ```typescript
  // If semantic sequencing fails 5 times in 10 seconds, disable for 30 seconds
  if (failureCount > 5 && timeSinceFirstFailure < 10000) {
  	// Skip semantic sequencing, use FSRS directly
  }
  ```

---

## 6. Recommended Action Items

### Priority 1: Critical (Must Fix for 10K Users)

1. **Implement Redis for Distributed Caching**
   - Replace in-memory cache with Redis
   - Use connection pooling for Redis
   - Add Redis health checks

2. **Optimize ConfusionPair Query**
   - Use UNION pattern instead of OR clause
   - Add composite index if needed

3. **Configure Database Connection Pooling**
   - Add connection_limit to DATABASE_URL
   - Monitor pool usage

### Priority 2: High (Should Fix Soon)

1. **Increase Cache Size or Use Better Strategy**
   - If keeping in-memory: increase to 100k entries
   - If using Redis: configure appropriate memory limits

2. **Add Request Rate Limiting**
   - Prevent abuse and smooth out traffic spikes

3. **Optimize Cache Key Strategy**
   - Use hashed keys instead of full vocabId lists

### Priority 3: Medium (Nice to Have)

1. **Add Partial Indexes for Etymology Queries**
2. **Implement Circuit Breaker Pattern**
3. **Add Performance Monitoring and Alerting**
4. **Consider Background Job for Pre-computation**

---

## 7. Testing Recommendations

### Load Testing

```typescript
// Use k6 or Artillery for load testing
import http from 'k6/http';

export const options = {
	stages: [
		{ duration: '1m', target: 1000 }, // Ramp up to 1K users
		{ duration: '3m', target: 1000 }, // Stay at 1K
		{ duration: '1m', target: 5000 }, // Ramp to 5K
		{ duration: '3m', target: 5000 }, // Stay at 5K
		{ duration: '1m', target: 10000 }, // Ramp to 10K
		{ duration: '5m', target: 10000 }, // Stay at 10K
	],
};

export default function () {
	http.post(
		'http://api/study/session',
		JSON.stringify({
			deckId: 'test-deck-id',
		}),
		{
			headers: { 'Content-Type': 'application/json' },
		},
	);
}
```

### Metrics to Monitor

1. **Response Time (p50, p95, p99)**
   - Target: p95 < 500ms
   - Alert if p95 > 1s

2. **Cache Hit Rate**
   - Target: >80%
   - Alert if <50%

3. **Database Connection Pool Usage**
   - Target: <80% utilization
   - Alert if >90%

4. **Error Rate**
   - Target: <0.1%
   - Alert if >1%

5. **Fallback Rate**
   - Target: <5% of requests
   - Alert if >20%

---

## 8. Conclusion

### Current State: ⚠️ **NOT READY FOR 10K+ USERS**

The implementation has **solid foundations** but requires **critical optimizations** before handling 10K+ concurrent users:

1. **In-memory cache must be replaced with Redis** (critical bottleneck)
2. **Database queries need optimization** (ConfusionPair OR clause)
3. **Connection pooling must be explicitly configured**

### Estimated Impact of Fixes

- **With Redis:** 80-90% reduction in DB queries, 5-10x better cache hit rate
- **With Query Optimization:** 30-50% faster relationship queries
- **With Connection Pooling:** Prevents connection exhaustion under load

### Timeline Estimate

- **Priority 1 Fixes:** 2-3 days
- **Priority 2 Fixes:** 1-2 days
- **Priority 3 Fixes:** 2-3 days
- **Total:** ~1 week of focused optimization work

---

## Appendix: Code Examples

### Redis Implementation Example

```typescript
// src/lib/cache/redis-cache.ts
import { createHash } from 'crypto';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class RedisCache<T> {
	async get(key: string): Promise<T | null> {
		const value = await redis.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: T, ttlSeconds: number): Promise<void> {
		await redis.setex(key, ttlSeconds, JSON.stringify(value));
	}

	async deletePattern(pattern: string): Promise<number> {
		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			return await redis.del(...keys);
		}
		return 0;
	}
}

// Usage in semantic-sequencer.service.ts
const relationshipCache = new RedisCache<RelationshipMap>();
const queueCache = new RedisCache<SmartCard[]>();
```

### Optimized ConfusionPair Query

```typescript
// src/modules/study/services/semantic-sequencer.service.ts
async function getConfusionPairRelationships(vocabIds: string[]): Promise<WordRelationship[]> {
	if (vocabIds.length < 2) return [];

	// Use UNION pattern for better index usage
	const [pairs1, pairs2] = await Promise.all([
		prisma.confusionPair.findMany({
			where: { vocabId1: { in: vocabIds } },
			select: { vocabId1: true, vocabId2: true, type: true },
		}),
		prisma.confusionPair.findMany({
			where: { vocabId2: { in: vocabIds } },
			select: { vocabId1: true, vocabId2: true, type: true },
		}),
	]);

	// Deduplicate using Map
	const pairMap = new Map<string, (typeof pairs1)[0]>();
	for (const pair of [...pairs1, ...pairs2]) {
		const key = `${pair.vocabId1}-${pair.vocabId2}`;
		const reverseKey = `${pair.vocabId2}-${pair.vocabId1}`;
		if (!pairMap.has(key) && !pairMap.has(reverseKey)) {
			pairMap.set(key, pair);
		}
	}

	return Array.from(pairMap.values()).map((pair) => ({
		vocabId1: pair.vocabId1,
		vocabId2: pair.vocabId2,
		type: 'CONFUSION' as const,
		strength: 0.9,
		metadata: { confusionType: pair.type },
	}));
}
```

---

**End of Review**
