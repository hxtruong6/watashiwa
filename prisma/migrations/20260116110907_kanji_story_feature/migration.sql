/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Story` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_words` to the `StoryLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `StoryLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReadingType" AS ENUM ('ONYOMI', 'KUNYOMI', 'IRREGULAR');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'daily_life',
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'N5',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "read_time_min" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT;

-- AlterTable
ALTER TABLE "StoryLog" ADD COLUMN     "analytics" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "read_time_seconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_words" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "words_collected" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "completed_at" DROP NOT NULL,
ALTER COLUMN "completed_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "StoryVocabulary" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "vocabulary_id" TEXT NOT NULL,
    "positions" JSONB NOT NULL,
    "word_surface" TEXT NOT NULL,
    "word_reading" TEXT NOT NULL,
    "word_length" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji" (
    "id" TEXT NOT NULL,
    "character" CHAR(1) NOT NULL,
    "meaning_vi" TEXT,
    "meaning_en" TEXT,
    "han_viet" TEXT,
    "onyomiReadings" TEXT[],
    "kunyomiReadings" TEXT[],
    "jlptLevel" INTEGER,
    "strokeCount" INTEGER NOT NULL,
    "frequency" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_composition" (
    "id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "kanji_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "active_reading" TEXT NOT NULL,
    "reading_type" "ReadingType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanji_composition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryVocabulary_story_id_idx" ON "StoryVocabulary"("story_id");

-- CreateIndex
CREATE INDEX "StoryVocabulary_vocabulary_id_idx" ON "StoryVocabulary"("vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "StoryVocabulary_story_id_vocabulary_id_key" ON "StoryVocabulary"("story_id", "vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_character_key" ON "kanji"("character");

-- CreateIndex
CREATE INDEX "kanji_jlptLevel_idx" ON "kanji"("jlptLevel");

-- CreateIndex
CREATE INDEX "kanji_frequency_idx" ON "kanji"("frequency");

-- CreateIndex
CREATE INDEX "kanji_composition_kanji_id_reading_type_idx" ON "kanji_composition"("kanji_id", "reading_type");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_composition_word_id_kanji_id_position_key" ON "kanji_composition"("word_id", "kanji_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_slug_idx" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_difficulty_category_idx" ON "Story"("difficulty", "category");

-- CreateIndex
CREATE INDEX "StoryLog_user_id_story_id_idx" ON "StoryLog"("user_id", "story_id");

-- AddForeignKey
ALTER TABLE "StoryVocabulary" ADD CONSTRAINT "StoryVocabulary_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryVocabulary" ADD CONSTRAINT "StoryVocabulary_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_composition" ADD CONSTRAINT "kanji_composition_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_composition" ADD CONSTRAINT "kanji_composition_kanji_id_fkey" FOREIGN KEY ("kanji_id") REFERENCES "kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;
