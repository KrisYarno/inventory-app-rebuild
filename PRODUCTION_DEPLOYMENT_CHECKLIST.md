# Production Deployment Checklist

## 🚨 CRITICAL - Must Fix Before Deployment

### 1. **Security Headers Configuration**
- [ ] Add security headers to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" }
      ],
    },
  ];
}
```

### 2. **Enable ESLint Error Checking**
- [ ] In `next.config.mjs`, change `ignoreDuringBuilds: true` to `false`
- [ ] Fix all ESLint errors before deployment

### 3. **CSRF Token Implementation**
- [ ] Add CSRF meta tag to root layout
- [ ] Update all client-side API calls to include CSRF tokens
- [ ] Verify CSRF validation is working on all POST/PUT/DELETE routes

### 4. **Rate Limiting**
- [ ] Install rate limiting package: `npm install express-rate-limit`
- [ ] Implement rate limiting middleware for:
  - Authentication endpoints (5 attempts per 15 minutes)
  - API endpoints (100 requests per minute)
  - Critical operations (10 per hour for sensitive actions)

### 5. **Error Boundaries**
- [ ] Create `app/error.tsx` for global error handling
- [ ] Create `app/not-found.tsx` for 404 pages
- [ ] Test error handling in production mode

## 🔐 Security Configuration

### 6. **Environment Variables**
- [ ] Generate production `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to HTTPS production URL
- [ ] Configure `DATABASE_URL` with SSL parameters:
  ```
  mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}&connection_limit=20
  ```
- [ ] Set `NODE_ENV=production`
- [ ] Configure SendGrid API key and verified sender email
- [ ] Set up OAuth credentials with production redirect URIs

### 7. **Database Security**
- [ ] Create production database user with limited permissions:
  ```sql
  GRANT SELECT, INSERT, UPDATE ON inventory_prod.* TO 'app_user'@'%';
  -- No DELETE, DROP, CREATE, ALTER permissions
  ```
- [ ] Enable SSL/TLS for database connections
- [ ] Set up connection pooling (20-30 connections)

### 8. **Authentication & Authorization**
- [ ] Verify middleware protects all admin routes
- [ ] Test OAuth login with production credentials
- [ ] Confirm user approval workflow is functioning
- [ ] Verify session expiration is set appropriately

## 📊 Database Migration

### 9. **Migration Strategy** (IMPORTANT: You have existing data)
- [ ] DO NOT run `prisma migrate deploy` on production
- [ ] Instead, use this approach:
  ```bash
  # 1. Pull current production schema
  npx prisma db pull
  
  # 2. Generate Prisma client
  npx prisma generate
  
  # 3. Verify schema matches your models
  ```
- [ ] Backup production database before any changes
- [ ] Test migrations on staging environment first

## 🚀 Deployment Process

### 10. **Pre-Deployment**
- [ ] Run production build locally: `npm run build`
- [ ] Fix any build errors
- [ ] Run tests: `npm test`
- [ ] Check bundle size: `npm run analyze`

### 11. **Render.com Configuration**
- [ ] Set all environment variables in Render dashboard
- [ ] Configure build command: `npm ci && npm run build`
- [ ] Set start command: `npm start`
- [ ] Enable automatic deploys from main branch
- [ ] Configure health check endpoint

### 12. **DNS & SSL**
- [ ] Point domain to Render
- [ ] Enable SSL certificate
- [ ] Set up www to non-www redirect
- [ ] Configure CORS allowed origins

## 🔍 Post-Deployment Verification

### 13. **Functional Testing**
- [ ] User registration and login (both methods)
- [ ] Admin approval workflow
- [ ] Inventory operations (stock-in, adjust, deduct)
- [ ] Product CRUD operations
- [ ] Mass inventory update
- [ ] Report generation
- [ ] Email notifications
- [ ] Audit log recording

### 14. **Security Verification**
- [ ] CSRF protection working on all forms
- [ ] Rate limiting active on critical endpoints
- [ ] OAuth redirect working correctly
- [ ] Sessions expiring appropriately
- [ ] No sensitive data in client-side code
- [ ] Security headers present in responses

### 15. **Performance Checks**
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized (check slow query log)
- [ ] Static assets served with cache headers
- [ ] Images optimized and lazy loaded

### 16. **Monitoring Setup**
- [ ] Error tracking configured (Sentry recommended)
- [ ] Uptime monitoring active
- [ ] Database performance monitoring
- [ ] Set up alerts for:
  - High error rates
  - Slow response times
  - Failed login attempts
  - Low disk space

## 📋 Rollback Plan

### 17. **Prepare for Rollback**
- [ ] Keep previous deployment available
- [ ] Document rollback procedure
- [ ] Test rollback on staging
- [ ] Have database backup ready
- [ ] Prepare communication plan

## ✅ Final Checklist

### 18. **Go/No-Go Decision**
- [ ] All critical issues resolved
- [ ] Security measures in place
- [ ] Performance acceptable
- [ ] Rollback plan ready
- [ ] Team briefed on deployment
- [ ] Maintenance window scheduled

### 19. **Post-Launch (First 24 Hours)**
- [ ] Monitor error logs continuously
- [ ] Check all critical user flows
- [ ] Verify email delivery
- [ ] Monitor database performance
- [ ] Check for security alerts
- [ ] Gather user feedback

### 20. **Week 1 Tasks**
- [ ] Daily error log review
- [ ] Performance optimization based on real usage
- [ ] Address any user-reported issues
- [ ] Security audit of logs
- [ ] Backup verification

## 📊 Success Metrics

- Zero critical errors in first 48 hours
- Page load times consistently < 3 seconds
- API response times < 500ms for 95% of requests
- No security incidents
- User satisfaction maintained or improved
- All automated tests passing

## 🎯 Deployment Sign-off

- [ ] Development team approval
- [ ] Security review complete
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Stakeholders notified

---

**Remember**: Deploy during low-traffic periods and have your rollback plan ready. Good luck with your deployment! 🚀