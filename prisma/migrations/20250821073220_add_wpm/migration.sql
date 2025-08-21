-- DropIndex
DROP INDEX "public"."comments_depth_idx";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "wpm" INTEGER NOT NULL DEFAULT 238;
