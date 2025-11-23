# PatientRegistrationForm

Form for patient onboarding, collecting basic profile and condition information.

## Location

- `src/components/forms/examples/PatientRegistrationForm.tsx`

## Fields

- `TextInput` — name, email, password
- `DatePicker` — date of birth
- `SelectField` — gender
- `LocationPicker` — location (`lat`, `lng`, `address?`)
- `TagInput` — conditions (optional)

## Validation

- Uses `patientRegistrationSchema` (`src/lib/validations/userSchemas.ts`)
- Key rules:
  - `name` ≥ 2 chars, `email` valid format, `password` ≥ 6 chars
  - `dateOfBirth` required, `gender` in `male|female|other`
  - `location` shape `{ lat, lng, address? }`

## UX Behavior

- Wrapped by `FormWrapper` for busy state, toasts, and layout
- Cancel button appears if `onCancel` is passed
- Submits via provided `onSubmit` with validated data

## Example

```tsx
<PatientRegistrationForm />
```

## Data Flow

- Frontend validates via Zod, POSTs to auth/signup (if wired)
- Location values propagate from `LocationPicker` to RHF control