-- AlterTable
ALTER TABLE "Vocabulary" ADD COLUMN     "furigana_mapping" JSONB;

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "description" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER NOT NULL,
    "deck_id" TEXT,
    "level" TEXT,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'ja',
    "targetLanguage" TEXT NOT NULL DEFAULT 'vi',
    "content_status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtitle" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "start_time" DOUBLE PRECISION NOT NULL,
    "end_time" DOUBLE PRECISION NOT NULL,
    "sentence" TEXT NOT NULL,
    "translation" JSONB NOT NULL,
    "words" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "current_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "watch_time" INTEGER NOT NULL DEFAULT 0,
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "last_watched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_deck_id_idx" ON "Video"("deck_id");

-- CreateIndex
CREATE INDEX "Video_content_status_idx" ON "Video"("content_status");

-- CreateIndex
CREATE INDEX "Subtitle_video_id_order_idx" ON "Subtitle"("video_id", "order");

-- CreateIndex
CREATE INDEX "Subtitle_video_id_start_time_idx" ON "Subtitle"("video_id", "start_time");

-- CreateIndex
CREATE INDEX "VideoLog_user_id_idx" ON "VideoLog"("user_id");

-- CreateIndex
CREATE INDEX "VideoLog_video_id_idx" ON "VideoLog"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "VideoLog_user_id_video_id_key" ON "VideoLog"("user_id", "video_id");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLog" ADD CONSTRAINT "VideoLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLog" ADD CONSTRAINT "VideoLog_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
