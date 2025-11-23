'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { followCategory, unfollowCategory } from '@/lib/services/forum';

interface FollowCategoryButtonProps {
  categoryId: string;
  isFollowed: boolean;
  onFollowChange: (isFollowed: boolean) => void;
}

export function FollowCategoryButton({ 
  categoryId, 
  isFollowed, 
  onFollowChange 
}: FollowCategoryButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleFollow = async () => {
    try {
      setLoading(true);
      if (isFollowed) {
        await unfollowCategory(categoryId);
        onFollowChange(false);
      } else {
        await followCategory(categoryId);
        onFollowChange(true);
      }
    } catch (error) {
      console.error('Error following category:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      variant={isFollowed ? "default" : "outline"} 
      size="sm" 
      onClick={handleFollow}
      disabled={loading}
    >
      {loading ? 'Processing...' : isFollowed ? 'Following' : 'Follow'}
    </Button>
  );
}