# CuraLink - Medical Research Platform

A Next.js 14 platform connecting patients with researchers, clinical trials, and publications.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Real-time Communication**: Socket.io
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS (indigo blue as primary color)
- **Validation**: Zod

## Project Structure

```
.
├── app/                 # Next.js App Router
├── components/          # UI components
├── lib/                 # Utilities, database, auth
├── models/              # MongoDB models
├── types/               # TypeScript types
├── hooks/               # Custom React hooks
├── public/              # Static assets
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Folder Structure Details

### app/ (Next.js App Router)
- `api/` - API routes
- `auth/` - Authentication pages
- `dashboard/` - Dashboard pages for different user types
- `forum/` - Forum pages
- `patient/` - Patient-specific pages
- `researcher/` - Researcher-specific pages
- `search/` - Search functionality pages

### components/ (UI Components)
- `ui/` - shadcn/ui components
- Custom components for the application

### lib/ (Utilities, Database, Auth)
- `db/` - Database connection and utilities
- `auth/` - Authentication configuration
- `socket/` - Socket.io configuration
- `utils/` - Utility functions and validation

### models/ (MongoDB Models)
- `user/` - User model
- `trial/` - Clinical trial model
- `publication/` - Publication model
- `forum/` - Forum models (categories, posts, comments)
- `message/` - Messaging model

### types/ (TypeScript Types)
- Type definitions for all models and interfaces

### hooks/ (Custom React Hooks)
- Custom hooks for application functionality

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd curalink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### User Types
- **Patient Dashboard**: View clinical trials, publications, and connect with researchers
- **Researcher Dashboard**: Manage trials, publications, and patient connections

### Real-time Messaging
- Socket.io implementation for real-time communication between researchers

### Forum
- Disease category-based forum system
- Posts and comments functionality

### Search
- Advanced search with matching percentage calculation (0-100%)
- Location-based search capabilities

### Location-based Features
- Geospatial indexing for location-based queries
- Distance calculation for matching algorithms

## Dependencies

### Core Dependencies
- `next`: React framework
- `react`/`react-dom`: React library
- `typescript`: Type checking
- `tailwindcss`: Utility-first CSS framework
- `mongoose`: MongoDB object modeling
- `next-auth`: Authentication solution
- `socket.io`/`socket.io-client`: Real-time communication
- `zod`: Validation library
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT implementation

### UI Dependencies
- `shadcn/ui`: Component library
- `lucide-react`: Icon library
- `sonner`: Toast notifications

### Development Dependencies
- `@types/*`: TypeScript definitions
- `eslint`: Code linting
- `@tailwindcss/postcss`: Tailwind CSS plugin

## shadcn/ui Components Used

- `button`
- `card`
- `dialog`
- `form`
- `input`
- `label`
- `select`
- `textarea`
- `sonner`

## Environment Variables

Create a `.env.local` file with the following variables:

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

## Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
