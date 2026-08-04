-- AlterTable: add profile fields that were added to the schema after the initial migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "governorate" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fieldOfStudy" TEXT;
