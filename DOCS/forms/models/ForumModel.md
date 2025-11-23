# Forum Models

MongoDB/Mongoose models underpinning forum categories, posts, and comments.

## Location

- `models/forum/Forum.ts`

## Entities

- `ForumCategoryModel`
  - `name`, `slug`
  - Derived from disease conditions (conceptually)
- `ForumPostModel`
  - `title`, `content`, `author`, `category`
  - `tags[]`, `attachments[]` (optional)
  - `upvotes[]`
  - `verified?` (researcher verification)
- `ForumCommentModel`
  - `content`, `author`, `post`
  - `parent`/`parentComment?` for nested replies
  - `upvotes[]`

## Relations

- Category 1—N Post
- Post 1—N Comment
- Comment N—N Comment (via `parentComment` for threading)

## API Interactions

- Post routes: create/read/update/delete, upvote, verify
- Comment routes: create/read/update/delete, upvote
- Category management: list and manage

## Notes

- Several API routes import `ForumPostModel` and `ForumCommentModel` for authorization and aggregation
- Nested comments supported via optional `parentId/parentComment` in endpoints