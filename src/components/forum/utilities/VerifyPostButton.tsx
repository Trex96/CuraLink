'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { verifyPost } from '@/lib/services/forum';

interface VerifyPostButtonProps {
  postId: string;
  isVerified: boolean;
  onVerify: () => void;
}

export function VerifyPostButton({ postId, isVerified, onVerify }: VerifyPostButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleVerify = async () => {
    try {
      setLoading(true);
      await verifyPost(postId);
      onVerify();
    } catch (error) {
      console.error('Error verifying post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Verified</span>
      </div>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleVerify}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <CheckCircle className="h-4 w-4" />
      {loading ? 'Verifying...' : 'Verify Answer'}
    </Button>
  );
}