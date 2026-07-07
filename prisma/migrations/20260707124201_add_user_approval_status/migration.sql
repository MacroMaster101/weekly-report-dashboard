-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED';
