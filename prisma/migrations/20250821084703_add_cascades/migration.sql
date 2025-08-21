-- DropForeignKey
ALTER TABLE "public"."BookCharacter" DROP CONSTRAINT "BookCharacter_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookCharacter" DROP CONSTRAINT "BookCharacter_characterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookWikiPage" DROP CONSTRAINT "BookWikiPage_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookWikiPage" DROP CONSTRAINT "BookWikiPage_wikiPageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chapter" DROP CONSTRAINT "Chapter_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."books" DROP CONSTRAINT "books_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_characters" DROP CONSTRAINT "chapter_characters_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_characters" DROP CONSTRAINT "chapter_characters_characterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_reads" DROP CONSTRAINT "chapter_reads_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_reads" DROP CONSTRAINT "chapter_reads_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."characters" DROP CONSTRAINT "characters_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."wiki_pages" DROP CONSTRAINT "wiki_pages_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."characters" ALTER COLUMN "creatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."books" ADD CONSTRAINT "books_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookCharacter" ADD CONSTRAINT "BookCharacter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookCharacter" ADD CONSTRAINT "BookCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookWikiPage" ADD CONSTRAINT "BookWikiPage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookWikiPage" ADD CONSTRAINT "BookWikiPage_wikiPageId_fkey" FOREIGN KEY ("wikiPageId") REFERENCES "public"."wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_pages" ADD CONSTRAINT "wiki_pages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
