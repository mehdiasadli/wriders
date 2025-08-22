-- DropForeignKey
ALTER TABLE "public"."email_verification_tokens" DROP CONSTRAINT "email_verification_tokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
