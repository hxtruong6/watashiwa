/*
  Warnings:

  - You are about to drop the column `cardId` on the `ReviewLog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ReviewLog` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `VocabCard` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `card_id` to the `ReviewLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ReviewLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReviewLog" DROP CONSTRAINT "ReviewLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "VocabCard" DROP CONSTRAINT "VocabCard_userId_fkey";

-- DropIndex
DROP INDEX "ReviewLog_cardId_idx";

-- DropIndex
DROP INDEX "ReviewLog_userId_idx";

-- AlterTable
ALTER TABLE "ReviewLog" DROP COLUMN "cardId",
DROP COLUMN "userId",
ADD COLUMN     "card_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "VocabCard";

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocab" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "word_surface" TEXT NOT NULL,
    "reading_kana" TEXT NOT NULL,
    "kanji_breakdown" JSONB NOT NULL,
    "han_viet" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example_sentence" JSONB NOT NULL,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vocab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kanji" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "kanji" TEXT NOT NULL,
    "onyomi" TEXT[],
    "kunyomi" TEXT[],
    "strokes" INTEGER NOT NULL,
    "han_viet" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "jlpt_level" TEXT,
    "radicals" JSONB NOT NULL,
    "examples" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyCard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vocab_id" TEXT,
    "kanji_id" TEXT,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsed_days" INTEGER NOT NULL DEFAULT 0,
    "scheduled_days" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "last_review" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deck_author_id_idx" ON "Deck"("author_id");

-- CreateIndex
CREATE INDEX "Vocab_deck_id_idx" ON "Vocab"("deck_id");

-- CreateIndex
CREATE INDEX "Kanji_deck_id_idx" ON "Kanji"("deck_id");

-- CreateIndex
CREATE INDEX "StudyCard_user_id_idx" ON "StudyCard"("user_id");

-- CreateIndex
CREATE INDEX "StudyCard_vocab_id_idx" ON "StudyCard"("vocab_id");

-- CreateIndex
CREATE INDEX "StudyCard_kanji_id_idx" ON "StudyCard"("kanji_id");

-- CreateIndex
CREATE INDEX "StudyCard_due_idx" ON "StudyCard"("due");

-- CreateIndex
CREATE INDEX "StudyCard_state_idx" ON "StudyCard"("state");

-- CreateIndex
CREATE INDEX "ReviewLog_card_id_idx" ON "ReviewLog"("card_id");

-- CreateIndex
CREATE INDEX "ReviewLog_user_id_idx" ON "ReviewLog"("user_id");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vocab" ADD CONSTRAINT "Vocab_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kanji" ADD CONSTRAINT "Kanji_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCard" ADD CONSTRAINT "StudyCard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCard" ADD CONSTRAINT "StudyCard_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "Vocab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCard" ADD CONSTRAINT "StudyCard_kanji_id_fkey" FOREIGN KEY ("kanji_id") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "StudyCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
