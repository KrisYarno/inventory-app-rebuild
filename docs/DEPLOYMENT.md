# Deployment Guide

This guide covers deploying the Inventory Management System to production.

## Deployment Options

### Vercel (Recommended for Next.js)

1. **Connect Repository**
   - Sign up at [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   DATABASE_URL=your-production-mysql-url
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=generate-new-secret
   GOOGLE_CLIENT_ID=your-google-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   SENDGRID_API_KEY=your-sendgrid-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Push to main branch
   - Vercel automatically builds and deploys

### Render

1. **Create Web Service**
   - New > Web Service
   - Connect GitHub repo
   - Runtime: Node

2. **Configure Settings**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node 18+

3. **Add Environment Variables**
   Same as Vercel list above

4. **Configure Health Check**
   - Path: `/api/health`
   - Add this endpoint if needed

### Railway

1. **Create New Project**
   - Deploy from GitHub repo
   - Add MySQL database

2. **Configure Service**
   - Start Command: `npm start`
   - Build Command: `npm run build`
   - Watch Paths: Disable for production

3. **Database Setup**
   - Railway provides DATABASE_URL automatically
   - No migration needed for existing DB

### Self-Hosted (VPS/Docker)

#### Using PM2

1. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

2. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'inventory-app',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package.json package-lock.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t inventory-app .
   docker run -p 3000:3000 --env-file .env.production inventory-app
   ```

## Production Database Setup

### Using Existing Database

Since you have a live database:

1. **No Migrations**: Do NOT run migrations
2. **Connection String**: Use production MySQL URL
3. **Connection Pooling**: Set appropriate limits:
   ```
   ?connection_limit=20&pool_timeout=30
   ```

### Database Providers

#### Railway MySQL
- Automatic SSL
- Connection pooling included
- Built-in backups

#### PlanetScale
- Serverless MySQL
- Automatic scaling
- No connection limits

#### Amazon RDS
- Managed MySQL
- Multi-AZ deployment
- Automated backups

## Environment Configuration

### Required for Production

```env
# Database
DATABASE_URL=mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}

# NextAuth
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OAuth (if using)
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret

# Email (if using)
SENDGRID_API_KEY=your-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Security Headers

Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database connection tested
- [ ] Authentication providers configured
- [ ] Email service configured (if using)
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Production domain configured
- [ ] SSL certificate active
- [ ] Monitoring/logging configured

## Post-Deployment

1. **Verify Core Functions**
   - [ ] User can sign up/login
   - [ ] Location switcher works
   - [ ] Products load correctly
   - [ ] Inventory operations work
   - [ ] Reports display data

2. **Monitor Performance**
   - Response times
   - Database connections
   - Error rates
   - Memory usage

3. **Set Up Backups**
   - Database backups
   - Environment variable backups
   - Regular testing of restore process

## Rollback Strategy

1. **Vercel/Render**: Use platform's rollback feature
2. **Self-hosted**: Keep previous build artifacts
3. **Database**: No schema changes, so no DB rollback needed

## Monitoring

### Application Monitoring
- Vercel Analytics (if using Vercel)
- New Relic
- Datadog
- Custom logging with Winston

### Error Tracking
- Sentry
- LogRocket
- Bugsnag

### Uptime Monitoring
- Pingdom
- UptimeRobot
- Better Uptime

## Scaling Considerations

1. **Database**
   - Increase connection pool size
   - Add read replicas
   - Implement caching layer

2. **Application**
   - Horizontal scaling with load balancer
   - CDN for static assets
   - Edge functions for API routes

3. **Performance**
   - Enable ISR for static pages
   - Implement Redis caching
   - Optimize database queries