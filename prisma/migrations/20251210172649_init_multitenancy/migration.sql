/*
  Warnings:

  - Added the required column `userId` to the `ReviewLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `VocabCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewLog" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VocabCard" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_idx" ON "ReviewLog"("userId");

-- CreateIndex
CREATE INDEX "VocabCard_userId_idx" ON "VocabCard"("userId");

-- AddForeignKey
ALTER TABLE "VocabCard" ADD CONSTRAINT "VocabCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
