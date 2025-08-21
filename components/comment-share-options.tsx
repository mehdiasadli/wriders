'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface CommentShareOptionsProps {
  commentTitle: string;
  commentUrl: string;
  bookTitle: string;
  chapterTitle: string;
  authorName: string;
}

export function CommentShareOptions({
  commentTitle,
  commentUrl,
  bookTitle,
  chapterTitle,
  authorName,
}: CommentShareOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    {
      value: 'copy-link',
      label: 'Copy Link',
      action: () => copyToClipboard(commentUrl),
    },
    {
      value: 'facebook',
      label: 'Facebook',
      action: () => shareOnFacebook(commentTitle, commentUrl),
    },
    {
      value: 'whatsapp',
      label: 'WhatsApp',
      action: () => shareOnWhatsApp(commentTitle, commentUrl),
    },
    {
      value: 'telegram',
      label: 'Telegram',
      action: () => shareOnTelegram(commentTitle, commentUrl),
    },
    {
      value: 'twitter',
      label: 'Twitter',
      action: () => shareOnTwitter(commentTitle, commentUrl),
    },
  ];

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareOnFacebook = (title: string, url: string) => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = (title: string, url: string) => {
    const text = `Check out this comment on "${chapterTitle}" from "${bookTitle}" by ${authorName}"`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnTelegram = (title: string, url: string) => {
    const text = `Check out this comment on "${chapterTitle}" from "${bookTitle}" by ${authorName}"`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const shareOnTwitter = (title: string, url: string) => {
    const text = `Check out this comment on "${chapterTitle}" from "${bookTitle}" by ${authorName}"`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
      >
        Share
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className='absolute left-0 bottom-full mb-2 w-32 bg-white border border-gray-200 shadow-sm z-20'>
            {shareOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className='w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors'
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
