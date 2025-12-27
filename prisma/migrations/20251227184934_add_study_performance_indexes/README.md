# Performance Indexes Migration

## Important: Manual Execution Required

This migration uses `CREATE INDEX CONCURRENTLY`, which cannot be run inside a transaction. Prisma migrations run in transactions, so these indexes must be created manually.

## Manual Execution Steps

1. **Connect to your database:**

   ```bash
   psql $DATABASE_URL
   ```

2. **Run the migration SQL manually:**

   ```sql
   -- Copy and paste the contents of migration.sql
   CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_reviewlog_user_date" 
     ON "ReviewLog"("user_id", "review_date");
   
   CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_userreview_user_created" 
     ON "UserReview"("user_id", "created_at") 
     WHERE "srs_stage" = 0;
   
   CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_reviewlog_user_rating" 
     ON "ReviewLog"("user_id", "review_date", "rating");
   ```

3. **Mark the migration as applied in Prisma:**

   ```bash
   npx prisma migrate resolve --applied 20251227184934_add_study_performance_indexes
   ```

## Why CONCURRENTLY?

- Prevents table locks during index creation
- Safe to run on production without downtime
- Takes longer but doesn't block writes

## Verification

After creating the indexes, run the verification script:

```bash
psql $DATABASE_URL -f scripts/verify-performance-indexes.sql
```

This will:

- Verify indexes exist
- Show EXPLAIN ANALYZE output to confirm index usage
- Display index statistics and sizes
