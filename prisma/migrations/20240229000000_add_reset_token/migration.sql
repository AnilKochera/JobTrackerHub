-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpires" TIMESTAMP(3);