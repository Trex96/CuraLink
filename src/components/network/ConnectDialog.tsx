'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ConnectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => Promise<void>;
    recipientName: string;
}

export function ConnectDialog({ isOpen, onClose, onSend, recipientName }: ConnectDialogProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        try {
            await onSend(message);
            setMessage('');
            onClose();
        } catch (error) {
            // Error handling should be done by the caller or here if needed
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect with {recipientName}</DialogTitle>
                    <DialogDescription>
                        Send a personalized message to introduce yourself.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Message (Optional)</Label>
                        <Textarea
                            placeholder={`Hi ${recipientName}, I'd like to connect...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSending}>Cancel</Button>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
