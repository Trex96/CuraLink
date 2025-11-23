# ResearcherProfileForm

Form for researcher profile setup, capturing professional details and expertise.

## Location

- `src/components/forms/examples/ResearcherProfileForm.tsx`

## Fields

- `TextInput` — first name, last name, institution
- `TextArea` — bio (≤ 500 chars)
- `TagInput` — expertise (≥ 1 required)
- Optional: `TextInput` — ORCID ID
- Optional: `Checkbox` — open for collaboration

## Validation

- Uses `researcherRegistrationSchema` (`src/lib/validations/userSchemas.ts`)
- Key rules:
  - `firstName`, `lastName`, `institution` required
  - `bio` ≤ 500 chars
  - `expertise` array with ≥ 1 item

## UX Behavior

- Wrapped by `FormWrapper`
- Surface validation via `FormMessage`
- Submit resolves promise and shows toast

## Example

```tsx
<ResearcherProfileForm />
```