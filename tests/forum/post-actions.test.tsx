import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostActions } from '@/components/forum/posts';

describe('PostActions', () => {
  const baseProps = {
    postId: 'post123',
    upvotes: [],
    replyCount: 2,
    commentCount: 2,
    currentUser: { id: 'user1', role: 'user' },
    onUpvote: jest.fn(),
    onShare: jest.fn(),
    onFollow: jest.fn(),
  };

  test('renders Like when user has not upvoted', () => {
    render(<PostActions {...baseProps} />);
    expect(screen.getByText('Like')).toBeInTheDocument();
  });

  test('renders Unlike when user has upvoted', () => {
    render(<PostActions {...baseProps} upvotes={["user1"]} />);
    expect(screen.getByText('Unlike')).toBeInTheDocument();
  });

  test('calls onUpvote with postId when clicked', () => {
    render(<PostActions {...baseProps} />);
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);
    expect(baseProps.onUpvote).toHaveBeenCalledWith('post123');
  });
});