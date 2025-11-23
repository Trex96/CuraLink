# Removal of Demo Form Components (2025-11-16)

We removed all example/demo form components and their wrapper to avoid confusion and ensure only production-ready components are used across the app.

## What Changed

- Deleted demo components:
  - `src/components/forms/examples/CreateForumPostForm.tsx`
  - `src/components/forms/examples/PatientRegistrationForm.tsx`
  - `src/components/forms/examples/ResearcherProfileForm.tsx`
  - `src/components/forms/examples/index.ts`
- Deleted demo page:
  - `src/app/forms/demo/page.tsx`
- Deleted demo form wrapper:
  - `src/components/forms/FormWrapper.tsx`
- Deleted demo field components:
  - `src/components/forms/fields/*` (entire directory)

## Replacement & Usage

- Forum post creation now uses production components:
  - Page: `src/app/forum/create/page.tsx`
  - Form: `src/components/forum/PostForm.tsx`
  - Service: `createForumPost(...)` from `src/lib/services/forum`

These components:
- Handle required interactions and validation
- Trigger correct submission events
- Integrate with application state (loading, toasts, navigation)
- Provide accessibility basics (`<label htmlFor>`, `aria-busy` on submit)

## Migration Steps

1. Remove imports of any demo forms:
   - Replace `@/components/forms/examples/*` imports with production alternatives.
   - For forum posting UI, route users to `/forum/create` or reuse `PostForm` directly.
2. If you embedded demo fields (`@/components/forms/fields/*`), replace them with UI components under `@/components/ui/*` and patterns used in `PostForm`.
3. Do not use `FormWrapper`; instead, compose forms with `react-hook-form` as needed, following `PostForm` patterns.

## Breaking Changes

- All paths under `@/components/forms/examples/*`, `@/components/forms/fields/*`, and `@/components/forms/FormWrapper.tsx` no longer exist.
- The demo page `forms/demo` has been removed.

## Validation Checklist

- Navigate to `/forum/create` and verify:
  - Title, category, and content validation works
  - Tag adding/removal works
  - Attachment upload functions and errors are handled
  - Submit shows loading state and navigates to the new post

## Notes

- If additional production forms are needed (e.g., patient registration, researcher profile), create them under `src/components/*` using the same design system and state management patterns as `PostForm`.