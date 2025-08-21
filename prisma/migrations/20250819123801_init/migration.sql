-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'AUTHOR', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT', 'SOON', 'ARCHIVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."AppearanceType" AS ENUM ('MENTION', 'APPEARANCE', 'POV');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_CHAPTER', 'WIKI_UPDATE', 'NEW_COMMENT');

-- CreateEnum
CREATE TYPE "public"."BookVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" "public"."UserRole"[] DEFAULT ARRAY['USER']::"public"."UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."series" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."books" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."BookVisibility" NOT NULL DEFAULT 'PRIVATE',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "seriesId" TEXT,
    "orderInSeries" INTEGER,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."book_follows" (
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_follows_pkey" PRIMARY KEY ("userId","bookId")
);

-- CreateTable
CREATE TABLE "public"."favorite_books" (
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_books_pkey" PRIMARY KEY ("userId","bookId")
);

-- CreateTable
CREATE TABLE "public"."favorite_chapters" (
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_chapters_pkey" PRIMARY KEY ("userId","chapterId")
);

-- CreateTable
CREATE TABLE "public"."favorite_characters" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_characters_pkey" PRIMARY KEY ("userId","characterId")
);

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "synopsis" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."characters" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT,
    "description" TEXT,
    "aliases" TEXT[],
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookCharacter" (
    "bookId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "BookCharacter_pkey" PRIMARY KEY ("bookId","characterId")
);

-- CreateTable
CREATE TABLE "public"."BookWikiPage" (
    "bookId" TEXT NOT NULL,
    "wikiPageId" TEXT NOT NULL,

    CONSTRAINT "BookWikiPage_pkey" PRIMARY KEY ("bookId","wikiPageId")
);

-- CreateTable
CREATE TABLE "public"."chapter_characters" (
    "chapterId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "appearanceType" "public"."AppearanceType" NOT NULL DEFAULT 'APPEARANCE',

    CONSTRAINT "chapter_characters_pkey" PRIMARY KEY ("chapterId","characterId")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chapter_reads" (
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_reads_pkey" PRIMARY KEY ("chapterId","userId")
);

-- CreateTable
CREATE TABLE "public"."wiki_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,

    CONSTRAINT "wiki_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "bookId" TEXT,
    "chapterId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "public"."users"("slug");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_slug_idx" ON "public"."users"("slug");

-- CreateIndex
CREATE INDEX "users_roles_idx" ON "public"."users"("roles");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "public"."users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "public"."series"("slug");

-- CreateIndex
CREATE INDEX "series_slug_idx" ON "public"."series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "books_slug_key" ON "public"."books"("slug");

-- CreateIndex
CREATE INDEX "books_slug_idx" ON "public"."books"("slug");

-- CreateIndex
CREATE INDEX "books_status_idx" ON "public"."books"("status");

-- CreateIndex
CREATE INDEX "books_publishedAt_idx" ON "public"."books"("publishedAt");

-- CreateIndex
CREATE INDEX "books_authorId_idx" ON "public"."books"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "books_seriesId_orderInSeries_key" ON "public"."books"("seriesId", "orderInSeries");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_slug_key" ON "public"."Chapter"("slug");

-- CreateIndex
CREATE INDEX "Chapter_slug_idx" ON "public"."Chapter"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_bookId_order_key" ON "public"."Chapter"("bookId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "characters_slug_key" ON "public"."characters"("slug");

-- CreateIndex
CREATE INDEX "characters_slug_idx" ON "public"."characters"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "comments_slug_key" ON "public"."comments"("slug");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "public"."comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_chapterId_idx" ON "public"."comments"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_pages_slug_key" ON "public"."wiki_pages"("slug");

-- CreateIndex
CREATE INDEX "wiki_pages_slug_idx" ON "public"."wiki_pages"("slug");

-- CreateIndex
CREATE INDEX "notifications_recipientId_idx" ON "public"."notifications"("recipientId");

-- AddForeignKey
ALTER TABLE "public"."books" ADD CONSTRAINT "books_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."books" ADD CONSTRAINT "books_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_follows" ADD CONSTRAINT "book_follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_follows" ADD CONSTRAINT "book_follows_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_books" ADD CONSTRAINT "favorite_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_books" ADD CONSTRAINT "favorite_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_chapters" ADD CONSTRAINT "favorite_chapters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_chapters" ADD CONSTRAINT "favorite_chapters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_characters" ADD CONSTRAINT "favorite_characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_characters" ADD CONSTRAINT "favorite_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookCharacter" ADD CONSTRAINT "BookCharacter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookCharacter" ADD CONSTRAINT "BookCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookWikiPage" ADD CONSTRAINT "BookWikiPage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookWikiPage" ADD CONSTRAINT "BookWikiPage_wikiPageId_fkey" FOREIGN KEY ("wikiPageId") REFERENCES "public"."wiki_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_pages" ADD CONSTRAINT "wiki_pages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
