# Forum Service

Client-side service functions for forum features: categories, posts, comments, votes, verification.

## Location

- `src/lib/services/forum.ts` (large file, ~1300 lines)

## Responsibilities

- Fetch forum categories and posts
- Create, update, delete posts
- Upvote/downvote posts and comments
- Fetch and create comments, nested replies
- Researcher actions: verify post, researcher threads and stats
- User activity (recent, upvoted), notifications

## Key Endpoints (used by service)

- Categories
  - `GET /api/forum/categories`
  - `POST /api/forum/categories/manage` (create/update/delete)
- Posts
  - `GET /api/forum/posts` / `GET /api/forum/posts/:id`
  - `POST /api/forum/posts` / `PUT /api/forum/posts/:id` / `DELETE /api/forum/posts/:id`
  - `POST /api/forum/posts/:id/upvote` / `POST /api/forum/posts/:id/verify`
  - `GET /api/forum/posts/user` / `GET /api/forum/posts/upvoted/user`
- Comments
  - `GET /api/forum/posts/:id/comments`
  - `POST /api/forum/posts/:id/comments`
  - `PUT /api/forum/comments/:id` / `DELETE /api/forum/comments/:id`
  - `POST /api/forum/comments/:id/upvote`
- Researcher
  - `GET /api/forum/researcher/threads` / `GET /api/forum/researcher/stats/:id`
  - `GET /api/forum/researcher/unanswered`
- Notifications
  - `GET /api/forum/notifications`

## Data Flow

- Service wraps `fetch` calls and returns JSON
- Handles error throwing and logging on non-OK responses
- Integrates with components like `PostForm`, `CommentForm`, `VerifiedPosts`

## Example Usage

```ts
import { createForumPost, getForumPosts, getCommentsForPost, createComment } from '@/lib/services/forum';

await createForumPost({ title, content, category, tags });
const posts = await getForumPosts({ category, sortBy, page });
const comments = await getCommentsForPost(postId, { sortBy: 'newest' });
await createComment(postId, { content, parentId });
```