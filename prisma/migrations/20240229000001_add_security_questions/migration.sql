-- AlterTable
ALTER TABLE "users" ADD COLUMN "securityQuestion" TEXT NOT NULL DEFAULT '',
                    ADD COLUMN "securityAnswer" TEXT NOT NULL DEFAULT '';

-- Remove email-based reset columns
ALTER TABLE "users" DROP COLUMN "resetToken",
                    DROP COLUMN "resetTokenExpires";