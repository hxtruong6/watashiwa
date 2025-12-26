-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "content_status" "ContentStatus" NOT NULL DEFAULT 'AI_GENERATED';

-- CreateTable
CREATE TABLE "StoryLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryLog_user_id_completed_at_idx" ON "StoryLog"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "StoryLog_story_id_idx" ON "StoryLog"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "StoryLog_user_id_story_id_key" ON "StoryLog"("user_id", "story_id");

-- CreateIndex
CREATE INDEX "Story_content_status_idx" ON "Story"("content_status");

-- AddForeignKey
ALTER TABLE "StoryLog" ADD CONSTRAINT "StoryLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryLog" ADD CONSTRAINT "StoryLog_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
