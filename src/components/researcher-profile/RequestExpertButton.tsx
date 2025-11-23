'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Researcher } from './types';

interface RequestExpertButtonProps {
  researcher: Researcher;
  onSendRequest: (message: string) => Promise<boolean>;
}

export function RequestExpertButton({ researcher, onSendRequest }: RequestExpertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setIsSending(true);
    try {
      const success = await onSendRequest(message);
      if (success) {
        toast.success('Request sent successfully!');
        setIsOpen(false);
        setMessage('');
      }
      return success;
    } catch (_error) {
      toast.error('Failed to send request');
      console.error("Error Found ", _error);
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Request Expert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Expert Consultation</DialogTitle>
          <DialogDescription>
            Send a message to {researcher.firstName} {researcher.lastName} to request their expertise.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your research interests or questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <Button 
            onClick={handleSendRequest} 
            disabled={isSending || !message.trim()}
          >
            {isSending ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}