import { z } from 'zod';

// Forum post schema
export const forumPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string().max(20, 'Tag length must be ≤ 20 characters')).max(10, 'Cannot have more than 10 tags').optional(),
});

// Forum comment schema
export const forumCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
  parentComment: z.string().optional(),
});

// Message composition schema
export const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject must be less than 100 characters'),
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message must be less than 5000 characters'),
});

export type ForumPost = z.infer<typeof forumPostSchema>;
export type ForumComment = z.infer<typeof forumCommentSchema>;
export type Message = z.infer<typeof messageSchema>;