-- AlterTable
-- Add OAuth provider tracking fields to User model
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "auth_providers" JSONB DEFAULT '[]';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "primary_auth_provider" TEXT;

-- Update existing users to have empty array for auth_providers
UPDATE "User" SET "auth_providers" = '[]' WHERE "auth_providers" IS NULL;

