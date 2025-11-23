'use client';

import { Button } from '@/components/ui/button';
import { Verified } from 'lucide-react';
import { toast } from 'sonner';

interface VerifyAnswerButtonProps {
  postId: string;
  onVerify: (postId: string) => void;
}

export function VerifyAnswerButton({ postId, onVerify }: VerifyAnswerButtonProps) {
  const handleVerify = async () => {
    try {
      onVerify(postId);
      toast.success('Post verified successfully!');
    } catch (error) {
      console.error('Error verifying post:', error);
      toast.error('Failed to verify post. Please try again.');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
      onClick={handleVerify}
    >
      <Verified className="h-4 w-4" />
      Verify Answer
    </Button>
  );
}