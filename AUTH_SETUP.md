# NextAuth.js Authentication Setup

This document provides comprehensive information about the NextAuth.js authentication implementation in SmartDocConverter.

## Overview

The application uses NextAuth.js v5 with the following features:
- Email/Password authentication with bcrypt password hashing
- Google OAuth integration
- JWT session strategy
- Prisma adapter for database persistence
- Protected routes with middleware
- Client-side and server-side auth utilities

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth pages layout
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   └── register/
│   │       └── page.tsx            # Register page
│   └── api/
│       └── auth/
│           ├── [...nextauth]/
│           │   └── route.ts        # NextAuth API handler
│           └── register/
│               └── route.ts        # User registration endpoint
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Login form component
│   │   └── RegisterForm.tsx        # Registration form component
│   └── providers/
│       └── SessionProvider.tsx     # NextAuth session provider wrapper
├── hooks/
│   └── useAuth.ts                  # Client-side auth hooks
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── auth-utils.ts               # Server-side auth utilities
│   └── db.ts                       # Prisma client
├── types/
│   └── next-auth.d.ts              # NextAuth TypeScript declarations
└── middleware.ts                    # Route protection middleware
```

## Environment Variables

Add the following to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartdocconverter"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to your `.env` file

## Database Setup

The Prisma schema already includes the necessary models for NextAuth:
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

Run migrations to create the tables:

```bash
npm run db:push
# or
npm run db:migrate
```

## Usage Examples

### Client-Side Authentication

#### Using the useAuth Hook

```tsx
"use client"

import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  )
}
```

#### Protecting Client Components

```tsx
"use client"

import { useRequireAuth } from "@/hooks/useAuth"

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>This page is protected</div>
}
```

#### Redirecting Authenticated Users

```tsx
"use client"

import { useRedirectIfAuthenticated } from "@/hooks/useAuth"

export default function LoginPage() {
  useRedirectIfAuthenticated("/") // Redirects to home if already logged in

  return <LoginForm />
}
```

#### Manual Sign In/Out

```tsx
"use client"

import { signIn, signOut } from "next-auth/react"

export default function AuthButtons() {
  return (
    <>
      <button onClick={() => signIn()}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </>
  )
}
```

### Server-Side Authentication

#### Using Server Components

```tsx
import { getCurrentUser, requireAuth } from "@/lib/auth-utils"

export default async function ProfilePage() {
  // Option 1: Get user (returns null if not authenticated)
  const user = await getCurrentUser()

  if (!user) {
    return <div>Please log in</div>
  }

  return <div>Welcome, {user.name}!</div>
}

// Option 2: Require authentication (redirects to login if not authenticated)
export default async function DashboardPage() {
  const session = await requireAuth()

  return <div>Welcome, {session.user.name}!</div>
}
```

#### Using API Routes

```tsx
import { getSession } from "@/lib/auth-utils"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // User is authenticated
  const userId = session.user.id

  return NextResponse.json({ userId })
}
```

## Route Protection

The middleware (`src/middleware.ts`) automatically protects routes. Public routes include:
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/tools/*` - Tool pages
- `/pricing` - Pricing page
- `/about` - About page
- `/contact` - Contact page
- `/terms` - Terms of service
- `/privacy` - Privacy policy

All other routes require authentication. To customize protected routes, edit `src/middleware.ts`.

## Authentication Flow

### Registration Flow

1. User fills out registration form (`RegisterForm.tsx`)
2. Form submits to `/api/auth/register`
3. API validates input and checks for existing user
4. Password is hashed using bcrypt (12 rounds)
5. User is created in database
6. User is automatically signed in using credentials provider
7. User is redirected to home page

### Login Flow

1. User fills out login form (`LoginForm.tsx`)
2. Form calls `signIn("credentials", {...})`
3. NextAuth validates credentials against database
4. bcrypt compares password with stored hash
5. JWT token is created and stored in cookie
6. User is redirected to home page

### OAuth Flow (Google)

1. User clicks "Sign in with Google"
2. User is redirected to Google OAuth consent screen
3. After approval, Google redirects to callback URL
4. NextAuth creates/updates user account in database
5. JWT token is created and stored in cookie
6. User is redirected to home page

## Security Features

1. **Password Hashing**: bcrypt with 12 rounds
2. **JWT Sessions**: Tokens stored in HTTP-only cookies
3. **CSRF Protection**: Built-in CSRF token validation
4. **Session Expiry**: 30-day session timeout
5. **Secure Cookies**: Production cookies are secure and HTTP-only
6. **Rate Limiting**: Consider implementing rate limiting on auth endpoints

## Customization

### Adding New OAuth Providers

Edit `src/lib/auth.ts`:

```tsx
import GitHubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  // ...
  providers: [
    // ... existing providers
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
}
```

### Customizing Session Data

Edit the JWT callback in `src/lib/auth.ts`:

```tsx
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.customField = user.customField
    }
    return token
  },
  async session({ session, token }) {
    session.user.customField = token.customField
    return session
  },
}
```

### Password Requirements

Edit the validation schema in `RegisterForm.tsx`:

```tsx
const registerSchema = z.object({
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
})
```

## Troubleshooting

### "Invalid credentials" error

- Verify database connection
- Check if user exists in database
- Ensure password is being hashed correctly
- Check bcrypt comparison in auth.ts

### OAuth not working

- Verify OAuth credentials in `.env`
- Check authorized redirect URIs in provider console
- Ensure NEXTAUTH_URL matches your domain

### Session not persisting

- Check NEXTAUTH_SECRET is set
- Verify cookies are being set (check browser dev tools)
- Check NEXTAUTH_URL matches your domain

### TypeScript errors

- Run `npm run db:generate` to regenerate Prisma client
- Restart TypeScript server in your IDE

## Best Practices

1. **Never expose NEXTAUTH_SECRET** - Keep it secure and rotate regularly
2. **Use environment variables** - Never hardcode sensitive data
3. **Implement rate limiting** - Protect auth endpoints from brute force
4. **Enable 2FA** - Consider adding two-factor authentication
5. **Email verification** - Implement email verification for new accounts
6. **Password reset** - Implement forgot password functionality
7. **Audit logging** - Log authentication events for security monitoring
8. **HTTPS only** - Always use HTTPS in production

## Next Steps

1. Implement email verification
2. Add password reset functionality
3. Implement two-factor authentication (2FA)
4. Add social login providers (GitHub, Twitter, etc.)
5. Implement rate limiting on auth endpoints
6. Add audit logging for authentication events
7. Set up session analytics and monitoring

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Adapter Documentation](https://authjs.dev/reference/adapter/prisma)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
