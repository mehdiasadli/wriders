import { BookSchema, ChapterSchema, SeriesSchema, UserSchema } from '@/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Eye, Heart, MessageCircle, Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface BookCardProps {
  book: BookSchema & {
    _count: { followers: number; favoritedBy: number };
    author: Pick<UserSchema, 'name' | 'slug'>;
    series: Pick<SeriesSchema, 'slug' | 'title'> | null;
    chapters: Pick<ChapterSchema, 'title' | 'status' | 'order'>[];
  };
}

export function BookCard({ book }: BookCardProps) {
  const publishedChapters = book.chapters.filter((ch) => ch.status === 'PUBLISHED');
  const totalReads = book.chapters.reduce((sum, ch) => sum + (ch as any)._count?.reads || 0, 0);
  const totalComments = book.chapters.reduce((sum, ch) => sum + (ch as any)._count?.comments || 0, 0);

  return (
    <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between mb-2'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2'>
              {book.series && (
                <Link href={`/series/${book.series.slug}`}>
                  <Badge variant='secondary' className='hover:bg-secondary/80 text-xs'>
                    {book.series.title}
                  </Badge>
                </Link>
              )}
              <Badge variant={book.visibility === 'PUBLIC' ? 'default' : 'outline'} className='text-xs'>
                {book.visibility}
              </Badge>
              <Badge variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'} className='text-xs'>
                {book.status}
              </Badge>
            </div>
            <CardTitle className='text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors'>
              {book.title}
            </CardTitle>
          </div>
        </div>

        <div className='flex items-center gap-2 mb-3'>
          <Avatar className='w-6 h-6'>
            <AvatarFallback className='text-xs bg-primary/10'>
              {book.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/users/${book.author.slug}`}
            className='text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1'
          >
            <User className='w-3 h-3' />
            {book.author.name}
          </Link>
        </div>

        {book.synopsis && (
          <CardDescription className='text-sm line-clamp-3 leading-relaxed'>{book.synopsis}</CardDescription>
        )}
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <BookOpen className='w-4 h-4' />
            <span>{publishedChapters.length} chapters</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Eye className='w-4 h-4' />
            <span>{totalReads} reads</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <MessageCircle className='w-4 h-4' />
            <span>{totalComments} comments</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Heart className='w-4 h-4' />
            <span>{book._count.favoritedBy} favorites</span>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between pt-3 border-t'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Calendar className='w-3 h-3' />
            <span>
              {book.publishedAt
                ? formatDistanceToNow(new Date(book.publishedAt), { addSuffix: true })
                : formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}
            </span>
          </div>

          <Button
            asChild
            variant='ghost'
            size='sm'
            className='group-hover:bg-primary group-hover:text-primary-foreground transition-colors'
          >
            <Link href={`/books/${book.slug}`} className='flex items-center gap-1'>
              View
              <ArrowRight className='w-3 h-3 group-hover:translate-x-1 transition-transform' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
