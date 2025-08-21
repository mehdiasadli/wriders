-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "depth" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "comments_depth_idx" ON "public"."comments"("depth");
