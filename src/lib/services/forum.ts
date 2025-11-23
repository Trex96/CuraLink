// import { ForumPost, ForumComment } from '@/types';

// Get all forum categories
export async function getForumCategories() {
  try {
    const response = await fetch('/api/forum/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch forum categories');
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    throw error;
  }
}

// Get forum posts with optional filters
export async function getForumPosts(options: {
  category?: string;
  limit?: number;
  offset?: number;
  sort?: 'createdAt' | 'upvotes' | 'replies';
  filter?: 'all' | 'unanswered' | 'trending' | 'recent';
} = {}) {
  try {
    const {
      category,
      limit = 10,
      offset = 0,
      sort = 'createdAt',
      filter = 'all'
    } = options;

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('sort', sort);
    params.append('filter', filter);

    const response = await fetch(`/api/forum/posts?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch forum posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    throw error;
  }
}

// Get posts for a specific category
export async function getForumPostsByCategory(
  category: string,
  options: {
    limit?: number;
    offset?: number;
    sort?: 'createdAt' | 'upvotes' | 'replies';
    filter?: 'all' | 'unanswered' | 'trending' | 'recent';
  } = {}
) {
  try {
    const {
      limit = 10,
      offset = 0,
      sort = 'createdAt',
      filter = 'all'
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('sort', sort);
    params.append('filter', filter);

    const response = await fetch(`/api/forum/${category}/posts?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch forum posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    throw error;
  }
}

// Create a new forum post
export async function createForumPost(
  title: string,
  content: string,
  category: string,
  tags?: string[],
  attachments?: { url: string; name: string; size: number }[]
) {
  try {
    const response = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        category,
        tags,
        attachments
      }),
    });

    if (!response.ok) {
      let message = 'Failed to create forum post';
      try {
        const errData = await response.json();
        if (Array.isArray(errData?.errors) && errData.errors.length > 0) {
          message = errData.errors[0]?.message || message;
        } else if (errData?.error) {
          message = errData.error;
        }
      } catch {
        // ignore parse errors
      }
      throw new Error(message);
    }

    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
}

// Upvote a forum post
export async function upvoteForumPost(postId: string) {
  try {
    const response = await fetch(`/api/forum/posts/${postId}/upvote`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to upvote forum post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error upvoting forum post:', error);
    throw error;
  }
}

// Create a comment on a forum post
export async function createForumComment(
  postId: string,
  content: string
) {
  try {
    const response = await fetch(`/api/forum/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to create forum comment');
    }

    const data = await response.json();
    return data.comment;
  } catch (error) {
    console.error('Error creating forum comment:', error);
    throw error;
  }
}

// Search forum posts
export async function searchForumPosts(query: string, options: {
  category?: string;
  tags?: string[];
  authorRole?: string;
  isVerified?: boolean;
  startDate?: Date;
  endDate?: Date;
  sort?: 'relevance' | 'date' | 'upvotes' | 'replies';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      category,
      tags,
      authorRole,
      isVerified,
      startDate,
      endDate,
      sort = 'relevance',
      order = 'desc',
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('q', query);
    if (category) params.append('category', category);
    if (tags && tags.length > 0) params.append('tags', tags.join(','));
    if (authorRole) params.append('authorRole', authorRole);
    if (isVerified !== undefined) params.append('isVerified', String(isVerified));
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    params.append('sort', sort);
    params.append('order', order);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to search forum posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching forum posts:', error);
    throw error;
  }
}

// Get researcher threads
export async function getResearcherThreads(options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/researcher/threads?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch researcher threads');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching researcher threads:', error);
    throw error;
  }
}

// Get post statistics
export async function getPostStats(postId: string) {
  try {
    const response = await fetch(`/api/forum/posts/${postId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch post stats');
    }
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching post stats:', error);
    throw error;
  }
}

// Verify a post (researcher only)
export async function verifyPost(postId: string) {
  try {
    const response = await fetch(`/api/forum/posts/${postId}/verify`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to verify post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying post:', error);
    throw error;
  }
}

// Get trending posts
export async function getTrendingPosts(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/posts/trending?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    throw error;
  }
}

// Get unanswered posts
export async function getUnansweredPosts(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/posts/unanswered?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch unanswered posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching unanswered posts:', error);
    throw error;
  }
}

// Get recent posts
export async function getRecentPosts(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/posts/recent?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    throw error;
  }
}

// Get posts by tag
export async function getPostsByTag(tag: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/tags/${tag}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by tag');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    throw error;
  }
}

// Get most upvoted posts
export async function getMostUpvotedPosts(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/posts/upvoted?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch most upvoted posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching most upvoted posts:', error);
    throw error;
  }
}

// Get most replied posts
export async function getMostRepliedPosts(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/posts/replied?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch most replied posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching most replied posts:', error);
    throw error;
  }
}

// Get most commented posts (alias of most replied in a comment-only system)
export async function getMostCommentedPosts(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    // Reuse the existing route which now returns commentCount as well
    const response = await fetch(`/api/forum/posts/replied?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch most commented posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching most commented posts:', error);
    throw error;
  }
}

// Get posts by author
export async function getPostsByAuthor(authorId: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/author/${authorId}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by author');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by author:', error);
    throw error;
  }
}

// Get posts by date range
export async function getPostsByDateRange(startDate: string, endDate: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/date?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by date range');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by date range:', error);
    throw error;
  }
}

// Get posts by filters
export async function getFilteredPosts(filters: {
  category?: string;
  tag?: string;
  authorId?: string;
  sort?: 'createdAt' | 'upvotes' | 'replies';
  limit?: number;
  offset?: number;
}) {
  try {
    const {
      category,
      tag,
      authorId,
      sort = 'createdAt',
      limit = 10,
      offset = 0
    } = filters;

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    if (authorId) params.append('authorId', authorId);
    params.append('sort', sort);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/filter?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to filter posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error filtering posts:', error);
    throw error;
  }
}

// Get all tags
export async function getAllTags() {
  try {
    const response = await fetch('/api/forum/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    const data = await response.json();
    return data.tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

// Get category stats
export async function getCategoryStats() {
  try {
    const response = await fetch('/api/forum/categories/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch category stats');
    }
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }
}

// Get user's posts
export async function getUserPosts(options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/user?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
}

// Get user's comments
export async function getUserComments(options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/comments/user?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user comments');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
}

// Get user's upvoted posts
export async function getUserUpvotedPosts(options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/upvoted/user?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user upvoted posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user upvoted posts:', error);
    throw error;
  }
}

// Get user's followed categories
export async function getUserFollowedCategories() {
  try {
    const response = await fetch('/api/forum/categories/followed');
    if (!response.ok) {
      throw new Error('Failed to fetch followed categories');
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching followed categories:', error);
    throw error;
  }
}

// Follow a category
export async function followCategory(categoryId: string) {
  try {
    const response = await fetch(`/api/forum/categories/${categoryId}/follow`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to follow category');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error following category:', error);
    throw error;
  }
}

// Unfollow a category
export async function unfollowCategory(categoryId: string) {
  try {
    const response = await fetch(`/api/forum/categories/${categoryId}/follow`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to unfollow category');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unfollowing category:', error);
    throw error;
  }
}

// Get forum notifications
export async function getForumNotifications(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/notifications?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch forum notifications');
    }
    const data = await response.json();
    return data.notifications;
  } catch (error) {
    console.error('Error fetching forum notifications:', error);
    throw error;
  }
}

// Mark a forum notification as read
export async function markForumNotificationAsRead(notificationId: string) {
  try {
    const response = await fetch(`/api/forum/notifications/${notificationId}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Get user's forum stats
export async function getUserForumStats() {
  try {
    const response = await fetch('/api/forum/user/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch user forum stats');
    }
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching user forum stats:', error);
    throw error;
  }
}

// Get popular categories
export async function getPopularCategories(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/categories/popular?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular categories');
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    throw error;
  }
}

// Search categories
export async function searchCategories(query: string, limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/categories/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to search categories');
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
}

// Get recent activity
export async function getRecentActivity(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/activity/recent?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }
    const data = await response.json();
    return data.activity;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}

// Get user's recent activity
export async function getUserRecentActivity(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/activity/user/recent?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user recent activity');
    }
    const data = await response.json();
    return data.activity;
  } catch (error) {
    console.error('Error fetching user recent activity:', error);
    throw error;
  }
}

// Get forum statistics
export async function getForumStats() {
  try {
    const response = await fetch('/api/forum/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch forum stats');
    }
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    throw error;
  }
}

// Get user's engagement score
export async function getUserEngagement() {
  try {
    const response = await fetch('/api/forum/user/engagement');
    if (!response.ok) {
      throw new Error('Failed to fetch user engagement');
    }
    const data = await response.json();
    return data.engagement;
  } catch (error) {
    console.error('Error fetching user engagement:', error);
    throw error;
  }
}

// Get forum leaderboard
export async function getForumLeaderboard(limit: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await fetch(`/api/forum/leaderboard?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch forum leaderboard');
    }
    const data = await response.json();
    return data.leaderboard;
  } catch (error) {
    console.error('Error fetching forum leaderboard:', error);
    throw error;
  }
}

// Get user's badges
export async function getUserBadges() {
  try {
    const response = await fetch('/api/forum/user/badges');
    if (!response.ok) {
      throw new Error('Failed to fetch user badges');
    }
    const data = await response.json();
    return data.badges;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
}

// Removed forum post favorites service functions

// Get posts by categories
export async function getPostsByCategories(categories: string[], options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const response = await fetch('/api/forum/posts/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories, limit, offset }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts by categories');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by categories:', error);
    throw error;
  }
}

// Get posts by date range and category
export async function getPostsByDateRangeAndCategory(category: string, startDate: string, endDate: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const response = await fetch('/api/forum/posts/date/category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, startDate, endDate, limit, offset }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts by date range and category');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by date range and category:', error);
    throw error;
  }
}

// Get posts by tags
export async function getPostsByTags(tags: string[], options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const response = await fetch('/api/forum/posts/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags, limit, offset }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts by tags');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by tags:', error);
    throw error;
  }
}

// Get posts by author role
export async function getPostsByAuthorRole(role: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/role/${role}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by author role');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by author role:', error);
    throw error;
  }
}

// Get high engagement posts
export async function getHighEngagementPosts(limit: number = 10, minEngagement: number = 10) {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('minEngagement', minEngagement.toString());

    const response = await fetch(`/api/forum/posts/engagement/high?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch high engagement posts');
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching high engagement posts:', error);
    throw error;
  }
}

// Get posts by verification status
export async function getPostsByVerificationStatus(isVerified: boolean, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const status = isVerified ? 'true' : 'false';
    const response = await fetch(`/api/forum/posts/verified/${status}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by verification status');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by verification status:', error);
    throw error;
  }
}

// Advanced filter posts
export async function filterPosts(filters: {
  categories?: string[];
  tags?: string[];
  authorRole?: string;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  try {
    const response = await fetch('/api/forum/posts/advanced-filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to filter posts');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error filtering posts:', error);
    throw error;
  }
}

// Get posts by engagement metrics
export async function getPostsByEngagementMetrics(metrics: {
  minReplies?: number;
  minUpvotes?: number;
  minViews?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    const response = await fetch('/api/forum/posts/engagement/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts by engagement metrics');
    }

    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching posts by engagement metrics:', error);
    throw error;
  }
}

// Get posts by time of day
export async function getPostsByTimeOfDay(time: 'morning' | 'afternoon' | 'evening' | 'night', options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/time/${time}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by time of day');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by time of day:', error);
    throw error;
  }
}

// Get posts by day of week
export async function getPostsByDayOfWeek(day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday', options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/weekday/${day}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by day of week');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by day of week:', error);
    throw error;
  }
}

// Get posts by month
export async function getPostsByMonth(month: 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december', options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/month/${month}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by month');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by month:', error);
    throw error;
  }
}

// Get posts by year
export async function getPostsByYear(year: number, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/year/${year}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by year');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by year:', error);
    throw error;
  }
}

// Get posts by season
export async function getPostsBySeason(season: 'spring' | 'summer' | 'autumn' | 'winter', options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/season/${season}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by season');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by season:', error);
    throw error;
  }
}

// Get posts by holiday
export async function getPostsByHoliday(holiday: 'new-year' | 'valentines' | 'easter' | 'independence' | 'halloween' | 'thanksgiving' | 'christmas', options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 10,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/posts/holiday/${holiday}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by holiday');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts by holiday:', error);
    throw error;
  }
}

// Get unanswered questions in researcher's field
export async function getUnansweredQuestionsInField(expertise?: string[], options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 5,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    if (expertise && expertise.length > 0) {
      expertise.forEach(tag => params.append('expertise', tag));
    }

    const response = await fetch(`/api/forum/researcher/unanswered?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch unanswered questions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching unanswered questions:', error);
    throw error;
  }
}

// Get researcher's answers
export async function getResearcherAnswers(researcherId: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const {
      limit = 5,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/forum/researcher/my-answers/${researcherId}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch researcher answers');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching researcher answers:', error);
    throw error;
  }
}

// Get researcher stats
export async function getResearcherStats(researcherId: string) {
  try {
    const response = await fetch(`/api/forum/researcher/stats/${researcherId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch researcher stats');
    }
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching researcher stats:', error);
    throw error;
  }
}

// Export forum data
export async function exportForumData() {
  try {
    const response = await fetch('/api/forum/export');
    if (!response.ok) {
      throw new Error('Failed to export forum data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exporting forum data:', error);
    throw error;
  }
}