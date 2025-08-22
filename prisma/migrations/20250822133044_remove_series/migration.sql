/*
  Warnings:

  - You are about to drop the column `orderInSeries` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `seriesId` on the `books` table. All the data in the column will be lost.
  - You are about to drop the `series` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AppTheme" AS ENUM ('LIGHT', 'DARK');

-- DropForeignKey
ALTER TABLE "public"."books" DROP CONSTRAINT "books_seriesId_fkey";

-- DropIndex
DROP INDEX "public"."books_seriesId_orderInSeries_key";

-- AlterTable
ALTER TABLE "public"."books" DROP COLUMN "orderInSeries",
DROP COLUMN "seriesId";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "theme" "public"."AppTheme" NOT NULL DEFAULT 'LIGHT';

-- DropTable
DROP TABLE "public"."series";
