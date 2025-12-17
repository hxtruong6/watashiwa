-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INCORRECT_READING', 'INCORRECT_MEANING', 'INCORRECT_HAN_VIET', 'TYPO', 'MISSING_AUDIO', 'WRONG_EXAMPLE', 'DUPLICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('MNEMONIC', 'USAGE_TIP', 'CULTURAL_NOTE', 'EXAMPLE', 'GRAMMAR', 'GENERAL');

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "header_image" TEXT,
ADD COLUMN     "title_en" TEXT;

-- AlterTable
ALTER TABLE "Kanji" ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allow_space_key" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "auto_show_answer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "auto_show_answer_delay" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "current_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "limit_new_cards" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "limit_reviews" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "longest_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "space_key_rating" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "Vocab" ADD COLUMN     "en_meaning" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "word_parts" JSONB,
ALTER COLUMN "reading_kana" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CardReport" (
    "id" TEXT NOT NULL,
    "vocab_id" TEXT,
    "kanji_id" TEXT,
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

-- CreateTable
CREATE TABLE "CardComment" (
    "id" TEXT NOT NULL,
    "vocab_id" TEXT,
    "kanji_id" TEXT,
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
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "header_image" TEXT,
    "level" TEXT,
    "tags" TEXT[],
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "CardReport_status_idx" ON "CardReport"("status");

-- CreateIndex
CREATE INDEX "CardReport_vocab_id_idx" ON "CardReport"("vocab_id");

-- CreateIndex
CREATE INDEX "CardReport_kanji_id_idx" ON "CardReport"("kanji_id");

-- CreateIndex
CREATE INDEX "CardReport_reporter_id_idx" ON "CardReport"("reporter_id");

-- CreateIndex
CREATE INDEX "CardComment_vocab_id_idx" ON "CardComment"("vocab_id");

-- CreateIndex
CREATE INDEX "CardComment_kanji_id_idx" ON "CardComment"("kanji_id");

-- CreateIndex
CREATE INDEX "CardComment_author_id_idx" ON "CardComment"("author_id");

-- CreateIndex
CREATE INDEX "CardComment_score_idx" ON "CardComment"("score");

-- CreateIndex
CREATE INDEX "CommentVote_comment_id_idx" ON "CommentVote"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_comment_id_user_id_key" ON "CommentVote"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX "Course_author_id_idx" ON "Course"("author_id");

-- CreateIndex
CREATE INDEX "CourseDeck_course_id_idx" ON "CourseDeck"("course_id");

-- CreateIndex
CREATE INDEX "CourseDeck_deck_id_idx" ON "CourseDeck"("deck_id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseDeck_course_id_deck_id_key" ON "CourseDeck"("course_id", "deck_id");

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_kanji_id_fkey" FOREIGN KEY ("kanji_id") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardReport" ADD CONSTRAINT "CardReport_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_kanji_id_fkey" FOREIGN KEY ("kanji_id") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardComment" ADD CONSTRAINT "CardComment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "CardComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDeck" ADD CONSTRAINT "CourseDeck_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDeck" ADD CONSTRAINT "CourseDeck_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
