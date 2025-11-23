# Post Creation Workflow Fix

This document captures the resolved issues and the final workflow for creating a new forum post, aligning the API and frontend behaviors with validation, error handling, transactions, and user experience improvements.

## Summary
- API `POST /api/forum/posts` now validates input via Zod (`forumPostSchema`), performs DB writes in a Mongoose transaction, and returns consistent status codes (422 for validation failures, 401 for auth, 201 on success).
- Frontend `PostForm` enforces client-side validation to match the API (title 5–200 chars, content ≥10 chars, up to 10 tags at ≤20 chars, up to 10 attachments ≤5MB), and surfaces errors via toasts.
- Service `createForumPost` surfaces detailed validation messages returned by the API.
- Unit tests added for GET and POST endpoints to ensure reliability.

## Data Flow
1. User fills `PostForm` and submits.
2. Client validates inputs and calls `createForumPost()`.
3. Service sends JSON to `POST /api/forum/posts`.
4. API:
   - Auth check.
   - Zod validation and category existence check.
   - Transaction: create `ForumPost`.
   - Commit, then attempt researcher notifications (best-effort).
5. On success, client navigates to the new post and shows success toast.
6. On failure, client shows a descriptive error toast (prefer first validation error).

## Status Codes
- `201 Created` on success with `post` payload.
- `401 Unauthorized` when session is missing.
- `422 Unprocessable Entity` with `{ error: 'Validation failed', errors: [{ path, message }] }` for validation issues.
- `500 Internal Server Error` for unexpected exceptions.

## Validation Rules
- Title: 5–200 characters.
- Content: minimum 10 characters.
- Category: must exist.
- Tags: up to 10; each ≤20 chars.
- Attachments: up to 10; each ≤5MB, must provide `url`, `name`, and `size`.

## Logging
- API logs structured errors on failures and notification dispatch issues.

## Tests
- `tests/api/forum/posts.test.ts` covers:
  - POST success
  - POST unauthorized (401)
  - POST validation failure (422)
  - GET basic listing

## References
- Forms system: `DOCS/forms/README.md`
- Component docs: `DOCS/forms/components/PostForm.md`, `DOCS/forms/components/CreateForumPostForm.md`
- Validations: `DOCS/forms/validations/ValidationSchemas.md`, `src/lib/validations/postSchemas.ts`
- API: `src/app/api/forum/posts/route.ts`
- Service: `src/lib/services/forum.ts`