# SmartDocConverter Setup Guide

## Prerequisites

- Node.js 20.x LTS or later
- npm 10.x or later
- PostgreSQL 16 (or Docker)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/SmartDocConverter.git
cd SmartDocConverter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartdocconverter"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# File Storage (optional for dev - uses local storage)
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
```

### 4. Database Setup

Using Docker (recommended):

```bash
docker-compose up -d db
```

Or with local PostgreSQL:

```bash
createdb smartdocconverter
```

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Development with Docker

Start all services:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Redis on port 6379
- Application on port 3000

View logs:

```bash
docker-compose logs -f app
```

Stop services:

```bash
docker-compose down
```

## Running Tests

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Code Quality

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Database Management

### View Database

Open Prisma Studio:

```bash
npx prisma studio
```

### Reset Database

```bash
npx prisma migrate reset
```

### Create New Migration

```bash
npx prisma migrate dev --name migration_name
```

## Troubleshooting

### Common Issues

**Database connection fails:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npx prisma generate`

**Build fails:**
- Delete `node_modules` and `.next`
- Run `npm install` again
- Check for TypeScript errors

**Auth not working:**
- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Verify OAuth credentials if using providers

### Getting Help

- Check [GitHub Issues](https://github.com/your-org/SmartDocConverter/issues)
- Review the [Architecture docs](./ARCHITECTURE.md)
- Contact the development team

## IDE Setup

### VS Code Extensions (Recommended)

- Tailwind CSS IntelliSense
- Prisma
- ESLint
- TypeScript Vue Plugin (Volar)

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
