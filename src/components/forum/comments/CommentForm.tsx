'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MentionAutocomplete } from '@/components/forum/inputs/MentionAutocomplete';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
  initialValue?: string;
}

export function CommentForm({ 
  onSubmit, 
  onCancel, 
  placeholder = "Write a comment...",
  initialValue = ""
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionTriggerIndex = useRef<number | null>(null);

  // Handle mention autocomplete
  useEffect(() => {
    if (content && textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart;
      const textBeforeCursor = content.substring(0, cursorPosition);
      
      // Check if we're typing after an @ symbol
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      const spaceAfterAt = textBeforeCursor.indexOf(' ', lastAtIndex);
      
      if (lastAtIndex !== -1 && (spaceAfterAt === -1 || spaceAfterAt > cursorPosition)) {
        const query = textBeforeCursor.substring(lastAtIndex + 1);
        if (query.length > 0) {
          setMentionQuery(query);
          setShowMentions(true);
          mentionTriggerIndex.current = lastAtIndex;
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [content]);

  const handleMentionSelect = (user: User) => {
    if (mentionTriggerIndex.current !== null && textareaRef.current) {
      const beforeMention = content.substring(0, mentionTriggerIndex.current);
      const afterMention = content.substring(
        textareaRef.current.selectionStart
      );
      
      const newContent = `${beforeMention}@${user.firstName} ${afterMention}`;
      setContent(newContent);
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current && mentionTriggerIndex.current !== null) {
          const newPosition = mentionTriggerIndex.current + user.firstName.length + 2;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setShowMentions(false);
    mentionTriggerIndex.current = null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    onSubmit(content);
    setIsSubmitting(false);
    setContent("");
  };

  const handleCancel = () => {
    setContent("");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="text-sm pr-10"
        />
        {showMentions && (
          <MentionAutocomplete
            query={mentionQuery}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentions(false)}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        Type @ to mention a user
      </div>
    </form>
  );
}