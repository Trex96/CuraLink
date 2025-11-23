# PostForm (Forum)

Feature component for composing forum posts with attachments, tags, and rich text.

## Location

- `src/components/forum/PostForm.tsx`

## Props (high-level)

- `onSubmit(data)` — callback with `{ title, content, category, tags, attachments? }`
- `onCancel()` — cancel action
- `loading?` — external submit/loading state
- `initialData?` — optional fields for edit scenarios

## Behavior

- Uses `react-hook-form` with controlled inputs
- Validates against forum post rules (client-side via Zod)
- Supports file attachments (upload flow via `/api/forum/posts/upload`)
- Manages tags and category selection

## Data Flow

- Client: validate → upload attachments (optional) → submit payload
- Service: `createForumPost`, `updateForumPost`, etc., inside `src/lib/services/forum.ts`
- API: `POST /api/forum/posts`, `PUT /api/forum/posts/:id`, `DELETE`, `GET`

## Example

```tsx
<PostForm onSubmit={handleCreate} onCancel={() => router.back()} />
```