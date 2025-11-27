# SmartDocConverter Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

#### Prerequisites
- Vercel account
- GitHub repository connected
- PostgreSQL database (Supabase, Neon, or Railway)

#### Steps

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these in Vercel project settings:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests

4. **Configure Domain**
   - Add custom domain in Vercel settings
   - Update NEXTAUTH_URL

### Option 2: Docker Deployment

For self-hosted deployments.

#### Build Image

```bash
docker build -t smartdocconverter .
```

#### Run with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: smartdocconverter
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: always

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: smartdocconverter
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### Option 3: Cloud Platforms

#### AWS

1. **ECS/Fargate**
   - Build and push Docker image to ECR
   - Create ECS task definition
   - Deploy to Fargate cluster

2. **Database: RDS PostgreSQL**
3. **Cache: ElastiCache Redis**
4. **Storage: S3**

#### Google Cloud

1. **Cloud Run**
   - Build with Cloud Build
   - Deploy container to Cloud Run

2. **Database: Cloud SQL**
3. **Cache: Memorystore**
4. **Storage: Cloud Storage**

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| NEXTAUTH_URL | Application URL | https://smartdocconverter.com |
| NEXTAUTH_SECRET | Session encryption key | openssl rand -base64 32 |

### Optional Variables

| Variable | Description |
|----------|-------------|
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth secret |
| S3_BUCKET | S3 bucket for file storage |
| S3_REGION | S3 region |
| S3_ACCESS_KEY_ID | S3 access key |
| S3_SECRET_ACCESS_KEY | S3 secret key |
| REDIS_URL | Redis connection URL |
| STRIPE_SECRET_KEY | Stripe API key |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret |

## Database Migrations

### Production Migrations

Run migrations on deployment:

```bash
npx prisma migrate deploy
```

**Important:** Never run `prisma migrate dev` in production.

### Rollback

Prisma doesn't support automatic rollbacks. Create a new migration to revert changes:

```bash
npx prisma migrate dev --name revert_changes
```

## SSL/TLS

### Vercel
- Automatic SSL with Let's Encrypt
- No configuration needed

### Self-Hosted
1. Use nginx as reverse proxy
2. Configure Let's Encrypt with certbot:

```nginx
server {
    listen 443 ssl http2;
    server_name smartdocconverter.com;

    ssl_certificate /etc/letsencrypt/live/smartdocconverter.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smartdocconverter.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Health Check

Application health endpoint:
```
GET /api/health
```

### Logging

- Application logs to stdout/stderr
- Use log aggregation service (Datadog, LogDNA, etc.)

### Alerts

Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- Storage limits

## Backup Strategy

### Database

1. **Automated Backups**
   - Configure daily PostgreSQL backups
   - Retain 7 days minimum

2. **Point-in-Time Recovery**
   - Enable WAL archiving for PITR

### Files

Files are temporary (1-hour expiry). No backup needed.

## Scaling

### Horizontal Scaling

1. **Stateless Design**
   - No server-side sessions stored locally
   - External file storage

2. **Load Balancer**
   - Use cloud load balancer or nginx
   - Sticky sessions not required

### Vertical Scaling

Increase resources as needed:
- CPU for conversion processing
- Memory for large file handling
- Storage for temporary files

## Security Checklist

- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database not publicly accessible
- [ ] Rate limiting enabled
- [ ] File size limits configured
- [ ] Security headers set
- [ ] Dependencies up to date
- [ ] Error messages don't leak info
