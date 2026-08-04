-- AlterTable: add profile fields that were added to the schema after the initial migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "governorate" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fieldOfStudy" TEXT;

-- Add unique constraint on phone if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_phone_key'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_phone_key" UNIQUE ("phone");
  END IF;
END $$;
