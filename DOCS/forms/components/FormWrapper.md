# FormWrapper

Centralized wrapper for all forms. Provides `react-hook-form` context, Zod validation, and consistent UI with shadcn/ui components.

## Location

- `src/components/forms/FormWrapper.tsx`
- Uses `src/components/ui/form.tsx` for form primitives

## Props

- `schema` — Zod schema used with `zodResolver`
- `onSubmit(data)` — async submit handler returning a promise
- `defaultValues?` — optional initial values
- `title?` / `description?` — optional header content
- `submitButtonText?` — default `"Submit"`
- `cancelButtonText?` — default `"Cancel"`
- `onCancel?()` — optional cancel handler
- `className?` — card container class
- `successMessage?` — toast on success; default generic
- `errorMessage?` — toast on failure; default generic

## Behavior

- Creates form context via `useForm` + `FormProvider` (`Form`)
- Validates with Zod (`zodResolver`), reporting errors via `FormMessage`
- Handles busy state (`isSubmitting`) and disables buttons during submit
- Renders children inside `CardContent`; actions in `CardFooter`
- Emits success/error toasts via `sonner`

## Usage

```tsx
<FormWrapper
  schema={mySchema}
  onSubmit={handleSubmit}
  title="Edit Profile"
  description="Update your personal information"
>
  <TextInput name="name" control={form.control} label="Name" />
  <TextArea name="bio" control={form.control} label="Bio" />
  {/* Add more fields */}
</FormWrapper>
```

## Integration

- Children should be RHF-controlled fields using `FormField` from `ui/form`
- Validation messages surface through `FormMessage`
- Works uniformly across Patient, Researcher, Forum forms

## Accessibility

- `ui/form.tsx` wires `aria-*` bindings for inputs and errors
- Labels and descriptions connect via `FormLabel` and `FormDescription`

## Notes

- Types are intentionally relaxed around resolver to avoid TS friction
- Toasts are customizable via `successMessage`/`errorMessage`