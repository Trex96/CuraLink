# Forms System Documentation Index

This directory houses comprehensive documentation for the forms system: architecture, reusable components, feature-specific forms, backend integrations, validations, and data models.

## Structure

- `components/` — UI components and feature-specific forms
- `services/` — backend service integrations and API flows
- `validations/` — schemas, rules, and client/server validation
- `models/` — data models backing forms (forum, users, trials)

## Page Hierarchy

- Components
  - `components/FormWrapper.md` — core form architecture and usage
  - `components/PatientRegistrationForm.md`
  - `components/ResearcherProfileForm.md`
  - `components/CreateForumPostForm.md`
  - `components/PostForm.md`
  - `components/CommentForm.md`
- Services
  - `services/ForumService.md` — forum service functions and endpoints
- Validations
  - `validations/ValidationSchemas.md` — user, trial, publication, forum post/comment
- Models
  - `models/ForumModel.md` — forum categories, posts, comments

## Component Connection Diagram

```mermaid
flowchart TD
  FW[FormWrapper] -->|provides RHF context| FI[Form Inputs]
  FI -->|bind via Controller| UI[shadcn/ui form]
  FW -->|uses| Zod[Zod schema]
  FW -->|submit| Service[Feature Service]
  Service --> API[Next.js API Routes]
  API --> DB[(MongoDB Models)]

  subgraph Examples
    PRF[PatientRegistrationForm]
    RPF[ResearcherProfileForm]
    CFPF[CreateForumPostForm]
    PF[PostForm]
    CF[CommentForm]
  end

  PRF --> FW
  RPF --> FW
  CFPF --> FW
  PF --> FW
  CF --> FW
```

## Data Flow Overview

```mermaid
sequenceDiagram
  participant U as User
  participant C as Component (Form*)
  participant FW as FormWrapper
  participant Z as Zod Resolver
  participant S as Service (forum.ts)
  participant API as Next.js API Route
  participant M as Model (Forum.ts)

  U->>C: Enter input / click Submit
  C->>FW: `handleSubmit` with `react-hook-form`
  FW->>Z: Validate data via schema
  Z-->>FW: Valid result or errors
  FW->>S: Call service function with payload
  S->>API: HTTP request
  API->>M: Validate, query, persist
  M-->>API: Created/queried data
  API-->>S: JSON response
  S-->>C: Resolve promise
  C-->>U: Success toast, navigation, or inline errors
```

## How to Use

- Start with `components/FormWrapper.md` to understand architecture and patterns.
- Review feature docs under `components/*` for behavior and props.
- Check `services/ForumService.md` for endpoint contracts and flows.
- See `validations/ValidationSchemas.md` for client/server rules.
- See `models/ForumModel.md` for data shape and relations.

## Cross-References

- `DOCS/FORUM_FORMS.md` — forum-centric flows and endpoints
- `src/app/PROMPT/forums-system.txt` — original product prompts and requirements