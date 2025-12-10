-- CreateTable
CREATE TABLE "VocabCard" (
    "id" TEXT NOT NULL,
    "word_surface" TEXT NOT NULL,
    "reading_kana" TEXT NOT NULL,
    "kanji_breakdown" JSONB NOT NULL,
    "han_viet" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example_sentence" JSONB NOT NULL,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsed_days" INTEGER NOT NULL DEFAULT 0,
    "scheduled_days" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "last_review" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_days" INTEGER NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VocabCard_due_idx" ON "VocabCard"("due");

-- CreateIndex
CREATE INDEX "VocabCard_state_idx" ON "VocabCard"("state");

-- CreateIndex
CREATE INDEX "ReviewLog_cardId_idx" ON "ReviewLog"("cardId");

-- CreateIndex
CREATE INDEX "ReviewLog_review_idx" ON "ReviewLog"("review");
