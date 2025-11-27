# Quick Start Guide - Authentication

## Setup Steps

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/smartdocconverter"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 2. Database Migration

Run Prisma migrations to create auth tables:

```bash
npm run db:push
# or
npm run db:migrate
```

### 3. Start Development Server

```bash
npm run dev
```

## Available Routes

- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **API**: http://localhost:3000/api/auth/*

## Quick Usage Examples

### Client Component - Get Current User

```tsx
"use client"
import { useAuth } from "@/hooks/useAuth"

export default function Component() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Not logged in</div>

  return <div>Hello, {user?.name}!</div>
}
```

### Server Component - Get Current User

```tsx
import { getCurrentUser } from "@/lib/auth-utils"

export default async function Component() {
  const user = await getCurrentUser()

  if (!user) return <div>Not logged in</div>

  return <div>Hello, {user.name}!</div>
}
```

### Server Component - Require Auth

```tsx
import { requireAuth } from "@/lib/auth-utils"

export default async function Component() {
  await requireAuth() // Redirects to /login if not authenticated

  return <div>This page is protected</div>
}
```

### API Route - Check Authentication

```tsx
import { getSession } from "@/lib/auth-utils"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return Response.json({ userId: session.user.id })
}
```

## Testing Authentication

### Create a Test User

1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create account"
4. You should be automatically logged in and redirected

### Login with Test User

1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Sign in"

### Test Google OAuth (Optional)

1. Set up Google OAuth credentials (see AUTH_SETUP.md)
2. Add credentials to `.env`
3. Click "Sign in with Google" on login page

## File Structure Reference

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Register page
│   └── api/
│       └── auth/
│           ├── [...nextauth]/     # NextAuth handler
│           └── register/          # Registration API
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          # Login form
│   │   └── RegisterForm.tsx       # Register form
│   └── providers/
│       └── SessionProvider.tsx    # Session wrapper
├── hooks/
│   └── useAuth.ts                 # Client auth hooks
├── lib/
│   ├── auth.ts                    # NextAuth config
│   └── auth-utils.ts              # Server utilities
└── middleware.ts                  # Route protection
```

## Common Tasks

### Add User to Database Manually

```typescript
// In a script or API route
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"

const hashedPassword = await bcrypt.hash("password123", 12)
const user = await prisma.user.create({
  data: {
    email: "test@example.com",
    name: "Test User",
    password: hashedPassword,
  }
})
```

### Sign Out Programmatically

```tsx
"use client"
import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  )
}
```

### Protect a Specific Route

Edit `src/middleware.ts` and remove the route from `publicPaths`.

## Troubleshooting

**Issue**: "Invalid credentials" when logging in
- Check database is running
- Verify user exists with: `npm run db:studio`
- Check password was hashed correctly

**Issue**: Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check authorized redirect URIs in Google Console
- Ensure callback URL is: `http://localhost:3000/api/auth/callback/google`

**Issue**: Session not persisting
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your development URL
- Clear browser cookies and try again

**Issue**: TypeScript errors
```bash
npm run db:generate  # Regenerate Prisma types
```

## Next Steps

See `AUTH_SETUP.md` for:
- Detailed authentication flows
- Security best practices
- Advanced customization
- Adding new OAuth providers
- Email verification setup
- Password reset implementation
