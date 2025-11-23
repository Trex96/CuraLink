# CuraLink Setup Instructions

## 1. Project Initialization Commands

```bash
# Create new Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install mongoose next-auth socket.io socket.io-client zod bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken

# Initialize shadcn/ui
npx shadcn@latest init

# Install shadcn/ui components
npx shadcn@latest add button card dialog form input label select textarea sonner
```

## 2. Folder Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── dashboard/         # Dashboard pages
│   │   ├── patient/
│   │   └── researcher/
│   ├── forum/             # Forum pages
│   ├── patient/           # Patient-specific pages
│   ├── researcher/        # Researcher-specific pages
│   └── search/            # Search functionality pages
├── components/            # UI components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, database, auth
│   ├── auth/              # Authentication configuration
│   ├── db/                # Database connection
│   ├── socket/            # Socket.io configuration
│   └── utils/             # Utility functions
├── models/                # MongoDB models
│   ├── forum/             # Forum models
│   ├── message/           # Messaging model
│   ├── publication/       # Publication model
│   ├── trial/             # Clinical trial model
│   └── user/              # User model
├── public/                # Static assets
├── types/                 # TypeScript types
├── .env.local             # Environment variables
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 3. Package.json Dependencies

### Core Dependencies
- `"next": "14+"`
- `"react": "18+"`
- `"react-dom": "18+"`
- `"typescript": "^5"`
- `"tailwindcss": "^3"`
- `"mongoose": "^7"`
- `"next-auth": "^4"`
- `"socket.io": "^4"`
- `"socket.io-client": "^4"`
- `"zod": "^3"`
- `"bcryptjs": "^2"`
- `"jsonwebtoken": "^9"`

### UI Dependencies
- `"@radix-ui/react-dialog": "^1"`
- `"@radix-ui/react-label": "^2"`
- `"@radix-ui/react-select": "^1"`
- `"@radix-ui/react-slot": "^1"`
- `"class-variance-authority": "^0"`
- `"clsx": "^1"`
- `"lucide-react": "^0"`
- `"sonner": "^0"`
- `"tailwind-merge": "^1"`

### Development Dependencies
- `"@types/node": "^18"`
- `"@types/react": "^18"`
- `"@types/react-dom": "^18"`
- `"eslint": "^8"`
- `"eslint-config-next": "14+"`

## 4. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

## 5. Environment Variables (.env.local)

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/curalink

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (optional)
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
```

## 6. Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      "bufferutil": "commonjs bufferutil",
    });
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
};

export default nextConfig;
```

## 7. TypeScript Configuration

The default tsconfig.json from Next.js is sufficient for this project.

## 8. lib/ Folder Setup

### Database Connection
- `lib/db/connect.ts`: MongoDB connection with caching
- `lib/db/global.d.ts`: Global type definitions for mongoose cache

### Authentication
- `lib/auth/auth.ts`: NextAuth configuration with Credentials, Google, and GitHub providers

### Socket.io
- `lib/socket/server.ts`: Socket.io server setup
- `hooks/useSocket.ts`: Client-side Socket.io hook

### Utilities
- `lib/utils/utils.ts`: Utility functions including matching percentage calculation
- `lib/utils/validation.ts`: Zod validation schemas

## 9. Components Folder Structure

The components folder contains:
- `ui/`: All shadcn/ui components
- Custom components will be added as needed

## 10. shadcn/ui Installation and Configuration

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add required components
npx shadcn@latest add button card dialog form input label select textarea sonner
```

## 11. MongoDB Models

- `User`: Patient and Researcher users with location support
- `Trial`: Clinical trials with geospatial indexing
- `Publication`: Research publications
- `Forum`: Forum categories, posts, and comments
- `Message`: Real-time messaging between users

## 12. API Routes

- `/api/auth/[...nextauth]`: NextAuth.js authentication
- `/api/auth/signup`: User registration

## 13. Middleware

Route protection using NextAuth middleware for:
- `/dashboard/*`
- `/patient/*`
- `/researcher/*`
- `/forum/*`
- `/search/*`

## 14. Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

## Auth Flow Updates

- Sign-in page (`/auth/signin`) performs role-aware redirects:
  - Patient → `/dashboard/patient`
  - Researcher → `/dashboard/researcher`
  - If `callbackUrl` is provided (e.g., from a protected route), it is respected.

- Global server-side protection via `middleware.ts`:
  - Protects `/dashboard/:path*`, `/messages/:path*`, `/forum/:path*`.
  - Enforces role checks on `/dashboard/patient` and `/dashboard/researcher`.
  - Unauthenticated users are redirected to `/auth/signin?callbackUrl=<original>`.

- `AuthProvider` is now part of app providers so `useAuth()` exposes consistent `user`, `isAuthenticated`, `isPatient`, `isResearcher`.

## Testing

- Install test dependencies:
  - `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest @types/jest`
- Run tests:
  - `npm test`
- Test coverage includes:
  - NextAuth callbacks (JWT/session).
  - Sign-in success and error flows.
  - Middleware protection (configured matchers and role gating).
## Authentication Workflow (Updated)

- Sign-in page (`/auth/signin`) uses credentials via NextAuth. On success, it fetches the session and performs role-aware redirects:
  - Patient → `/dashboard/patient`
  - Researcher → `/dashboard/researcher`
  - If `callbackUrl` is present (e.g., user was redirected from a protected page), it is respected.

- Global protection via `src/middleware.ts`:
  - Protects `/dashboard/:path*`, `/messages/:path*`, and `/forum/:path*`.
  - Enforces role-based access on the dashboards.
  - Unauthenticated users are redirected to `/auth/signin?callbackUrl=<original-url>`.

- Client-side context:
  - `AuthProvider` is now wired into `ClientProviders`, so `useAuth()` returns consistent session-backed `user` state and role helpers.

- Sign-out:
  - Use `signOut({ callbackUrl: '/' })` for reliable session cleanup and redirect.

## Testing Auth

- Requirements: `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `ts-jest`.
- Run tests: `npm test`.
- Coverage includes:
  - NextAuth callbacks: token and session enrichment.
  - Sign-in page: success flow with role-aware redirect, failed sign-in inline error.
  - Middleware config: protected matchers and role gating are asserted (for deeper logic tests, extract authorization into a pure helper).
