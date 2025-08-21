'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface FavoriteBookButtonProps {
  bookSlug: string;
}

export function FavoriteBookButton({ bookSlug }: FavoriteBookButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial favorite status
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/books/${bookSlug}/favorite`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsFavorited(data.data.favorited);
            setFavoriteCount(data.data.count);
          }
        }
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [bookSlug]);

  const handleToggleFavorite = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/books/${bookSlug}/favorite`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const newFavorited = data.data.favorited;
        setIsFavorited(newFavorited);

        // Update count optimistically
        setFavoriteCount((prev) => (newFavorited ? prev + 1 : prev - 1));

        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to update favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border ${
        isFavorited
          ? 'border-gray-900 text-gray-900 bg-gray-50'
          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      {isFavorited ? 'Favorited' : 'Favorite'}
      {favoriteCount > 0 && <span className='text-xs text-gray-500'>({favoriteCount})</span>}
    </button>
  );
}
