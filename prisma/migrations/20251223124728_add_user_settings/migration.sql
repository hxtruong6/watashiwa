/*
  Warnings:

  - You are about to drop the column `tutorials` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tutorials",
ADD COLUMN     "auto_play_audio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "daily_goal" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "enable_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enable_priming" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enable_smart_pacing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "reminder_time" TEXT,
ADD COLUMN     "show_etymology" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_pitch_accent" BOOLEAN NOT NULL DEFAULT true;
