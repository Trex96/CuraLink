'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface AcceptDeclineButtonsProps {
  collaborationId: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function AcceptDeclineButtons({ 
  collaborationId, 
  onAccept, 
  onDecline 
}: AcceptDeclineButtonsProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(collaborationId);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to accept collaboration',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await onDecline(collaborationId);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to decline collaboration',
      });
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleDecline}
        disabled={isAccepting || isDeclining}
      >
        {isDeclining ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <X className="mr-2 h-4 w-4" />
        )}
        Decline
      </Button>
      <Button 
        onClick={handleAccept}
        disabled={isAccepting || isDeclining}
      >
        {isAccepting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Accept
      </Button>
    </div>
  );
}