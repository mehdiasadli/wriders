'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface FollowBookButtonProps {
  bookSlug: string;
}

export function FollowBookButton({ bookSlug }: FollowBookButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const response = await fetch(`/api/books/${bookSlug}/follow`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsFollowing(data.data.following);
            setFollowCount(data.data.count);
          }
        }
      } catch (error) {
        console.error('Error fetching follow status:', error);
      }
    };

    fetchFollowStatus();
  }, [bookSlug]);

  const handleToggleFollow = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/books/${bookSlug}/follow`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const newFollowing = data.data.following;
        setIsFollowing(newFollowing);

        // Update count optimistically
        setFollowCount((prev) => (newFollowing ? prev + 1 : prev - 1));

        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to update follow');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border ${
        isFollowing
          ? 'border-gray-900 text-gray-900 bg-gray-50'
          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFollowing ? <UserCheck className='w-4 h-4' /> : <UserPlus className='w-4 h-4' />}
      {isFollowing ? 'Following' : 'Follow'}
      {followCount > 0 && <span className='text-xs text-gray-500'>({followCount})</span>}
    </button>
  );
}
