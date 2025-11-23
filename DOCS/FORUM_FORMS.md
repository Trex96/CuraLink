# Forum Forms and API Flow

This document summarizes the forum form flows, related API endpoints, and recent robustness updates.

## Post Creation Flow

- Fetch categories: `GET /api/forum/categories`
- Optional upload attachments: `POST /api/forum/posts/upload` (validates type and size ≤ 5MB)
- Submit post: `POST /api/forum/posts`
  - Required: `title`, `content`, `category`
  - Optional: `tags[]` (≤5 tags, each ≤20 chars), `attachments[]`
  - Server validations:
    - Title 3–150 chars; Content ≥10 chars
    - Category must exist in `ForumCategory`
    - Attachments must include `url`, `name`, `size` and size ≤ 5MB; capped at 10
  - On success: returns created `post` and triggers researcher notifications based on category/tags.

### Client Components

- `PostForm`
  - Fields: title, category, rich content, tags, attachments
  - Error toasts for missing required fields and category load errors
  - Upload UI with 5MB limit
- `CreatePostPage`
  - Calls `createForumPost(...)` and navigates to `/forum/posts/:id` on success
  - Shows detailed error toast using server response message

## Comments Flow

- List comments: `GET /api/forum/posts/:id/comments?limit&offset&sortBy`
- Create comment: `POST /api/forum/posts/:id/comments`
  - Validates post existence
  - Populates author fields
  - Flat, comment-only model (no nested replies, no `parentId`)

### Comment Actions

- Update comment: `PUT /api/forum/comments/:id` (author only)

### Cross-References

- Forms architecture and index: `DOCS/forms/README.md`
- Components:
  - `DOCS/forms/components/PostForm.md`
  - `DOCS/forms/components/CommentForm.md`
  - `DOCS/forms/components/CreateForumPostForm.md`
  - `DOCS/forms/components/FormWrapper.md`
- Services: `DOCS/forms/services/ForumService.md`
- Validations: `DOCS/forms/validations/ValidationSchemas.md`
- Models: `DOCS/forms/models/ForumModel.md`
- Delete comment: `DELETE /api/forum/comments/:id` (author only; hard delete)
- Upvote comment: `POST /api/forum/comments/:id/upvote`
- Verify answer (researcher): `POST /api/forum/comments/:id/verify`

## Post Actions

- Get post: `GET /api/forum/posts/:id` (includes `commentCount`; `replyCount` kept as alias)
- Upvote post: `PUT /api/forum/posts/:id/upvote`
- Verify post (researcher): `PUT /api/forum/posts/:id/verify`
- Post stats: `GET /api/forum/posts/:id/stats`

 All dynamic routes consistently unwrap async `params` and validate `ObjectId` formats before DB operations.
 
 Note: Forum post favorites have been removed (APIs, services, and UI).

## Pagination, Sorting, and Filters

- Post listing: `GET /api/forum/posts?category&limit&offset&sort&filter`
  - Clamps `limit` to 1–50 and ensures `offset ≥ 0`
  - Supports filters: `all`, `unanswered`, `trending`, `recent`
- Includes `commentCount` (and `replyCount` alias) via aggregation
- Sorting by `replies` is treated as sorting by `commentCount`

## Notes

- Attachments are mocked; production systems should use cloud storage and signed URLs.
- Notifications to researchers are dispatched based on category/tags matches with researcher expertise.