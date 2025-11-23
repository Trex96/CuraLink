# CreateForumPostForm

Example form for creating forum posts using reusable fields and `FormWrapper`.

## Location

- `src/components/forms/examples/CreateForumPostForm.tsx`

## Fields

- `TextInput` — title
- `SelectField` — category (e.g., general, research, trials, publications)
- `RichTextEditor` — content (Tiptap-based)
- `TagInput` — tags (≤ reasonable number, UX describes usage)

## Validation

- Uses `forumPostSchema` (`src/lib/utils/validation.ts`)
- Key rules:
  - `title` ≥ 5 chars, `content` ≥ 10 chars
  - `category` required
  - `tags` optional array

## UX Behavior

- Wrapped by `FormWrapper` to show busy state and toasts
- Submit button toggles text: `Creating...` when submitting

## Example

```tsx
<CreateForumPostForm />
```