# Validation Schemas

Central validation rules used across forms. Powered by `zod`.

## Location

- `src/lib/utils/validation.ts` (primary definitions)
- `src/lib/validations/userSchemas.ts` (user-specific forms)
- `src/lib/validations/index.ts` (re-exports)

## User

- `baseUserSchema`: name, email, password
- `patientRegistrationSchema`:
  - `dateOfBirth` required
  - `gender` in `male|female|other`
  - `conditions` optional array
  - `location` `{ lat, lng, address? }`
- `researcherRegistrationSchema`:
  - `firstName`, `lastName`, `institution` required
  - `bio` ≤ 500 chars
  - `expertise` array with ≥ 1 item
  - `orcidId?`, `openForCollaboration` default false
- `profileUpdateSchema`: partial user update
- `settingsSchema`: notifications and privacy

## Forum

- `forumPostSchema`:
  - `title` ≥ 5 chars
  - `content` ≥ 10 chars
  - `author`, `category` required
  - `tags?` optional array
- `forumCommentSchema`:
  - `content` ≥ 1 char
  - `author`, `post` required
  - `parentComment?` optional for replies

## Trials

- `trialSchema`:
  - `title` ≥ 5 chars, `description` ≥ 10 chars
  - `researcher`, `diseaseCategory` required
  - `location` `{ type: 'Point', coordinates: [number, number] }`
  - `startDate`, `endDate`, `maxParticipants` ≥ 1
  - `eligibilityCriteria` array ≥ 1 item
  - `status?` enum

## Publications

- `publicationSchema`:
  - `title` ≥ 5 chars, `abstract` ≥ 20 chars
  - `authors` ≥ 1, `researcher`, `diseaseCategory` required
  - `publicationDate`, `journal` required
  - `doi?`, `keywords` ≥ 1

## Messages

- `messageSchema`:
  - `sender`, `recipient` required
  - `content` ≥ 1 char