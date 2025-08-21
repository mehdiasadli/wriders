'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart, Eye, Calendar, BookOpen, User, FileText, Users } from 'lucide-react';
import { BookSchema, ChapterSchema, SeriesSchema, UserSchema } from '@/schemas';
import Link from 'next/link';

interface BookProps {
  book: BookSchema & {
    _count: { followers: number; favoritedBy: number };
    author: Pick<UserSchema, 'name' | 'slug'>;
    series: Pick<SeriesSchema, 'slug' | 'title'> | null;
    chapters: (Pick<ChapterSchema, 'title' | 'status' | 'order'> & {
      _count: {
        reads: number;
        comments: number;
      };
    })[];
  };
}

const Book: React.FC<BookProps> = ({ book }) => {
  const [isHovered, setIsHovered] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);

  const totalReads = book.chapters.reduce((sum, ch) => sum + ch._count.reads, 0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!bookRef.current) return;

    const rect = bookRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/books/${book.slug}`}>
      <motion.div
        ref={bookRef}
        className='relative cursor-pointer'
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className='relative w-64 h-80'
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Book Pages (Main Content) */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-100 dark:to-zinc-50 rounded-r-lg shadow-xl'
            style={{
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Page Content */}
            <div className='h-full p-6 text-zinc-800 overflow-hidden flex flex-col'>
              {/* Published Date */}
              {book.publishedAt && (
                <div className='flex items-center justify-between text-xs mb-1'>
                  <span className='font-medium text-[10px] text-zinc-400'>{formatDate(book.publishedAt)}</span>
                </div>
              )}

              {/* Header */}
              <div className='border-b border-zinc-300 pb-4 mb-6'>
                <h3 className='text-xl font-bold text-zinc-900 mb-1'>{book.title}</h3>
                <p className='text-sm text-zinc-600 flex items-center gap-1'>
                  <User className='w-3 h-3' />
                  {book.author.name}
                </p>
              </div>

              {/* Synopsis */}
              <div className='flex-1'>
                <h4 className='text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-1'>
                  <FileText className='w-3 h-3' />
                  Synopsis
                </h4>
                <p className='text-xs leading-relaxed text-zinc-600'>
                  {!book.synopsis
                    ? 'No synopsis has been provided'
                    : book.synopsis.length > 175
                      ? book.synopsis.slice(0, 175) + '...'
                      : book.synopsis}
                </p>
              </div>

              {/* Compact Stats - Sticky to Bottom */}
              <div className='mt-auto pt-4'>
                <div className='flex items-center justify-between text-xs mb-3'>
                  <div className='flex items-center gap-1'>
                    <BookOpen className='w-3 h-3 text-zinc-600' />
                    <span className='font-medium text-zinc-800'>{book.chapters.length}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Eye className='w-3 h-3 text-zinc-600' />
                    <span className='font-medium text-zinc-800'>{formatNumber(totalReads)}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Heart className='w-3 h-3 text-zinc-600' />
                    <span className='font-medium text-zinc-800'>{formatNumber(book._count.favoritedBy)}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users className='w-3 h-3 text-zinc-600' />
                    <span className='font-medium text-zinc-800'>{formatNumber(book._count.followers)}</span>
                  </div>
                </div>

                {/* Page Lines */}
                <div className='space-y-1'>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className='h-px bg-zinc-300' />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Book Spine */}
          <div className='absolute left-0 top-0 w-4 h-80 bg-gradient-to-b from-amber-800 to-red-900 transform -translate-x-2 rounded-l-lg shadow-lg'>
            <div className='h-full w-full bg-gradient-to-r from-black/20 to-transparent rounded-l-lg' />
          </div>
        </motion.div>

        {/* Shadow */}
        <motion.div
          className='absolute -bottom-4 left-4 right-4 h-8 bg-black/20 rounded-full blur-lg'
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.3 : 0.2,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
};

export default Book;
