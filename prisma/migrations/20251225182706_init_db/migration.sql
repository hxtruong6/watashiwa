-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'AI_GENERATED', 'FLAGGED', 'VERIFIED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "VariantType" AS ENUM ('BASIC', 'CONTEXT_GAP_FILL', 'AUDIO_MATCH', 'INTERVENTION');

-- CreateEnum
CREATE TYPE "ConfusionType" AS ENUM ('HOMONYM', 'LOOKALIKE', 'SYNONYM', 'ANTONYM', 'GRAMMAR');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('MNEMONIC', 'USAGE_TIP', 'CULTURAL_NOTE', 'EXAMPLE', 'GRAMMAR', 'GENERAL');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INCORRECT_READING', 'INCORRECT_MEANING', 'INCORRECT_HAN_VIET', 'TYPO', 'MISSING_AUDIO', 'WRONG_EXAMPLE', 'DUPLICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'DUPLICATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "limit_new_cards" INTEGER NOT NULL DEFAULT 10,
    "limit_reviews" INTEGER NOT NULL DEFAULT 50,
    "daily_goal" INTEGER NOT NULL DEFAULT 20,
    "enable_smart_pacing" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "auto_play_audio" BOOLEAN NOT NULL DEFAULT true,
    "show_pitch_accent" BOOLEAN NOT NULL DEFAULT true,
    "show_etymology" BOOLEAN NOT NULL DEFAULT true,
    "enable_priming" BOOLEAN NOT NULL DEFAULT true,
    "enable_notifications" BOOLEAN NOT NULL DEFAULT true,
    "reminder_time" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_study_date" DATE,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "header_image" TEXT,
    "level" TEXT,
    "tags" TEXT[],
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "header_image" TEXT,
    "sort_order" INTEGER,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseDeck" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "tags" TEXT[],
    "word_surface" TEXT NOT NULL,
    "word_reading" TEXT NOT NULL,
    "word_romaji" TEXT,
    "han_viet" TEXT,
    "pitch_pattern" INTEGER,
    "pitch_svg_path" TEXT,
    "homonym_group_id" TEXT,
    "etymology" JSONB NOT NULL,
    "meanings" JSONB NOT NULL,
    "mnemonic" JSONB,
    "examples" JSONB NOT NULL,
    "audio_url" TEXT,
    "image_url" TEXT,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "word_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardVariant" (
    "id" TEXT NOT NULL,
    "vocab_id" TEXT NOT NULL,
    "variant_type" "VariantType" NOT NULL,
    "content_payload" JSONB NOT NULL,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfusionPair" (
    "id" TEXT NOT NULL,
    "vocab_id_1" TEXT NOT NULL,
    "vocab_id_2" TEXT NOT NULL,
    "explanation" JSONB NOT NULL,
    "type" "ConfusionType" NOT NULL DEFAULT 'HOMONYM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfusionPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStudyStat" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cards_reviewed" INTEGER NOT NULL DEFAULT 0,
    "new_cards_learned" INTEGER NOT NULL DEFAULT 0,
    "review_duration_ms" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStudyStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "queue" JSONB NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReview" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vocab_id" TEXT NOT NULL,
    "srs_stage" INTEGER NOT NULL DEFAULT 0,
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsed_days" INTEGER NOT NULL DEFAULT 0,
    "scheduled_days" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "last_review" TIMESTAMP(3),
    "personal_anchor" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "scheduled_days" INTEGER NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardComment" (
    "id" TEXT NOT NULL,
    "vocab_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "CommentType" NOT NULL DEFAULT 'GENERAL',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardReport" (
    "id" TEXT NOT NULL,
    "vocab_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "field" TEXT,
    "current_value" TEXT,
    "suggested_value" TEXT,
    "notes" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolved_by_id" TEXT,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_user_id_idx" ON "PushSubscription"("user_id");

-- CreateIndex
CREATE INDEX "Course_author_id_idx" ON "Course"("author_id");

-- CreateIndex
CREATE INDEX "Deck_author_id_idx" ON "Deck"("author_id");

-- CreateIndex
CREATE INDEX "CourseDeck_course_id_idx" ON "CourseDeck"("course_id");

-- CreateIndex
CREATE INDEX "CourseDeck_deck_id_idx" ON "CourseDeck"("deck_id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseDeck_course_id_deck_id_key" ON "CourseDeck"("course_id", "deck_id");

-- CreateIndex
CREATE INDEX "Vocabulary_deck_id_idx" ON "Vocabulary"("deck_id");

-- CreateIndex
CREATE INDEX "Vocabulary_content_status_idx" ON "Vocabulary"("content_status");

-- CreateIndex
CREATE INDEX "Vocabulary_homonym_group_id_idx" ON "Vocabulary"("homonym_group_id");

-- CreateIndex
CREATE INDEX "CardVariant_vocab_id_idx" ON "CardVariant"("vocab_id");

-- CreateIndex
CREATE INDEX "CardVariant_content_status_idx" ON "CardVariant"("content_status");

-- CreateIndex
CREATE INDEX "ConfusionPair_vocab_id_1_idx" ON "ConfusionPair"("vocab_id_1");

-- CreateIndex
CREATE INDEX "ConfusionPair_vocab_id_2_idx" ON "ConfusionPair"("vocab_id_2");

-- CreateIndex
CREATE INDEX "Story_unit_id_idx" ON "Story"("unit_id");

-- CreateIndex
CREATE INDEX "DailyStudyStat_user_id_idx" ON "DailyStudyStat"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStudyStat_user_id_date_key" ON "DailyStudyStat"("user_id", "date");

-- CreateIndex
CREATE INDEX "StudySession_user_id_idx" ON "StudySession"("user_id");

-- CreateIndex
CREATE INDEX "UserReview_user_id_next_review_at_idx" ON "UserReview"("user_id", "next_review_at");

-- CreateIndex
CREATE INDEX "UserReview_user_id_srs_stage_idx" ON "UserReview"("user_id", "srs_stage");

-- CreateIndex
CREATE UNIQUE INDEX "UserReview_user_id_vocab_id_key" ON "UserReview"("user_id", "vocab_id");

-- CreateIndex
CREATE INDEX "ReviewLog_review_id_idx" ON "ReviewLog"("review_id");

-- CreateIndex
CREATE INDEX "ReviewLog_review_date_idx" ON "ReviewLog"("review_date");

-- CreateIndex
CREATE INDEX "ReviewLog_user_id_idx" ON "ReviewLog"("user_id");

-- CreateIndex
CREATE INDEX "CardComment_vocab_id_idx" ON "CardComment"("vocab_id");

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_comment_id_user_id_key" ON "CommentVote"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX "CardReport_status_idx" ON "CardReport"("status");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDeck" ADD CONSTRAINT "CourseDeck_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDeck" ADD CONSTRAINT "CourseDeck_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardVariant" ADD CONSTRAINT "CardVariant_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfusionPair" ADD CONSTRAINT "ConfusionPair_vocab_id_1_fkey" FOREIGN KEY ("vocab_id_1") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfusionPair" ADD CONSTRAINT "ConfusionPair_vocab_id_2_fkey" FOREIGN KEY ("vocab_id_2") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStudyStat" ADD CONSTRAINT "DailyStudyStat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReview" ADD CONSTRAINT "UserReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReview" ADD CONSTRAINT "UserReview_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "UserReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "CardComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
