# CommentForm (Forum)

Feature component for writing comments and replies on forum posts.

## Location

- `src/components/forum/CommentForm.tsx`

## Props (high-level)

- `onSubmit(data)` — callback with `{ content, parentId? }`
- `onCancel()` — cancel action
- `placeholder?` — input placeholder
- `initialValue?` — prefill content (edit/reply)

## Behavior

- Uses `react-hook-form` for controlled input
- Supports replying via `parentId` when provided by the parent
- Detects `@username` mentions (UX hint), autocomplete may be integrated
- Disables submit when content empty or while submitting

## API Integration

- Create: `POST /api/forum/posts/:id/comments`
  - Payload: `{ content, parentId? }`
  - Validates post existence and author
- List: `GET /api/forum/posts/:id/comments?limit&offset&sortBy`
  - Supports pagination and sorting

## Data Flow

```mermaid
sequenceDiagram
  participant U as User
  participant CF as CommentForm
  participant S as Forum Service
  participant API as Comments Route
  participant M as Forum Models

  U->>CF: Type comment / click Post
  CF->>S: createComment(postId, { content, parentId? })
  S->>API: POST /api/forum/posts/:id/comments
  API->>M: Validate and persist comment
  M-->>API: Created comment
  API-->>S: JSON response
  S-->>CF: Resolve with created comment
  CF-->>U: Clear field / show success toast
```

## Example

```tsx
<CommentForm onSubmit={(data) => createComment(postId, data)} onCancel={() => setReplying(false)} />
```