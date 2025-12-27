-- CreateIndex
-- Index for ReviewLog queries by user and date
-- Optimizes getDailyStats() reviewsToday query
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_reviewlog_user_date" 
  ON "ReviewLog"("user_id", "review_date");

-- CreateIndex
-- Index for new cards count (filtered by srs_stage = 0)
-- Optimizes newCardsToday with srs_stage filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_userreview_user_created" 
  ON "UserReview"("user_id", "created_at") 
  WHERE "srs_stage" = 0;

-- CreateIndex
-- Index for accuracy calculation (rating filter)
-- Optimizes accuracy calculation (rating >= 2 filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_reviewlog_user_rating" 
  ON "ReviewLog"("user_id", "review_date", "rating");

