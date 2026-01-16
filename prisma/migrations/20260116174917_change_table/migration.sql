/*
  Warnings:

  - You are about to drop the `kanji` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kanji_composition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "kanji_composition" DROP CONSTRAINT "kanji_composition_kanji_id_fkey";

-- DropForeignKey
ALTER TABLE "kanji_composition" DROP CONSTRAINT "kanji_composition_word_id_fkey";

-- DropTable
DROP TABLE "kanji";

-- DropTable
DROP TABLE "kanji_composition";

-- CreateTable
CREATE TABLE "Kanji" (
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

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiComposition" (
    "id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "kanji_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "active_reading" TEXT NOT NULL,
    "reading_type" "ReadingType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanjiComposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kanji_character_key" ON "Kanji"("character");

-- CreateIndex
CREATE INDEX "Kanji_jlptLevel_idx" ON "Kanji"("jlptLevel");

-- CreateIndex
CREATE INDEX "Kanji_frequency_idx" ON "Kanji"("frequency");

-- CreateIndex
CREATE INDEX "KanjiComposition_kanji_id_reading_type_idx" ON "KanjiComposition"("kanji_id", "reading_type");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiComposition_word_id_kanji_id_position_key" ON "KanjiComposition"("word_id", "kanji_id", "position");

-- AddForeignKey
ALTER TABLE "KanjiComposition" ADD CONSTRAINT "KanjiComposition_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiComposition" ADD CONSTRAINT "KanjiComposition_kanji_id_fkey" FOREIGN KEY ("kanji_id") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;
