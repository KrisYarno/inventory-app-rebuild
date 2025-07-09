# 🚀 Production Deployment Checklist

## Overview
This checklist ensures a secure and successful deployment of the Inventory Management System to production. Items are prioritized by criticality.

---

## 🔴 CRITICAL - Must Fix Before Deployment

### 1. Security Headers Configuration
**Priority**: CRITICAL  
**Issue**: Missing security headers in `next.config.mjs`

```javascript
// Add to next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
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
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];

// Add headers configuration to nextConfig
```

### 2. ESLint Configuration
**Priority**: CRITICAL  
**Issue**: ESLint errors ignored during builds

```javascript
// Fix in next.config.mjs
eslint: {
  ignoreDuringBuilds: false, // Change from true to false
}
```

### 3. CSRF Protection Implementation
**Priority**: CRITICAL  
**Issue**: CSRF protection not implemented in API routes

- [ ] Add CSRF token validation to all state-changing API routes
- [ ] Implement CSRF token in forms and API calls
- [ ] Add meta tag for CSRF token in layout

### 4. Rate Limiting
**Priority**: CRITICAL  
**Issue**: No rate limiting configured

- [ ] Implement rate limiting middleware for API routes
- [ ] Configure limits per endpoint (auth: 5/min, API: 100/min)
- [ ] Add IP-based rate limiting for authentication endpoints

---

## 🟠 HIGH PRIORITY - Security & Configuration

### 5. Environment Variables

#### Required Production Variables:
```env
# Database (with SSL)
DATABASE_URL="mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}&connection_limit=20"

# Authentication (HTTPS required)
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="[Generate with: openssl rand -base64 32]"

# OAuth
GOOGLE_CLIENT_ID="production-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="production-client-secret"

# Email Service
SENDGRID_API_KEY="SG.production-key"
FROM_EMAIL="inventory@yourdomain.com"

# Security
CRON_SECRET="[Generate with: openssl rand -base64 32]"
```

#### Validation Checklist:
- [ ] All secrets are unique and strong (32+ characters)
- [ ] NEXTAUTH_URL uses HTTPS
- [ ] DATABASE_URL includes SSL configuration
- [ ] Different credentials than development/staging
- [ ] No debug flags enabled

### 6. Database Security
- [ ] Create production database user with minimal permissions:
  ```sql
  GRANT SELECT, INSERT, UPDATE ON inventory_db.* TO 'app_user'@'%';
  -- No DELETE, DROP, CREATE, ALTER permissions
  ```
- [ ] Enable SSL/TLS for database connections
- [ ] Configure connection pooling (20 connections max)
- [ ] Set query timeout limits

### 7. Authentication & Authorization
- [ ] Verify middleware protects all routes correctly
- [ ] Test admin-only routes return 403 for non-admin users
- [ ] Confirm unapproved users cannot access protected routes
- [ ] Validate session timeout configuration

---

## 🟡 MEDIUM PRIORITY - Performance & Monitoring

### 8. Error Tracking & Monitoring
```env
# Add to production environment
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"
LOG_LEVEL="info"
```

- [ ] Configure Sentry for error tracking
- [ ] Set up application monitoring (New Relic/DataDog)
- [ ] Configure centralized logging
- [ ] Set up uptime monitoring

### 9. Performance Optimization
- [ ] Enable Next.js production optimizations
- [ ] Configure CDN for static assets
- [ ] Set up Redis for session storage (optional)
- [ ] Enable response compression
- [ ] Configure proper caching headers

### 10. Backup & Recovery
- [ ] Configure automated database backups
- [ ] Test backup restoration process
- [ ] Document recovery procedures
- [ ] Set up backup monitoring alerts

---

## 🟢 STANDARD - Pre-deployment Steps

### 11. Code Quality Checks
```bash
# Run all checks locally first
npm run lint
npm run type-check
npm run build
npm run test
```

- [ ] Fix all ESLint errors
- [ ] Resolve TypeScript errors
- [ ] All tests passing
- [ ] Build completes successfully

### 12. Database Migration Steps
Based on the migration guide, if using existing database:

1. **DO NOT run Prisma migrations**
2. **Verify schema compatibility**:
   ```bash
   npm run db:pull
   npm run db:generate
   ```
3. **Check for required tables**: users, products, locations, inventory_logs, product_locations
4. **Ensure locations exist**:
   ```sql
   SELECT COUNT(*) FROM locations;
   -- If 0, run seed script
   ```

### 13. OAuth Configuration
- [ ] Update Google OAuth redirect URIs:
  - Add: `https://your-domain.com/api/auth/callback/google`
  - Remove localhost URLs
- [ ] Verify OAuth consent screen configuration
- [ ] Test OAuth flow in staging environment

---

## 📋 DEPLOYMENT EXECUTION

### 14. Deployment Platform Configuration

#### Vercel:
- [ ] Set all environment variables
- [ ] Configure custom domain
- [ ] Enable automatic HTTPS
- [ ] Set Node.js version to 18+
- [ ] Configure build command: `npm run build`

#### Other Platforms:
- [ ] Configure health check endpoint: `/api/health`
- [ ] Set process manager (PM2) configuration
- [ ] Configure reverse proxy (Nginx) with security headers
- [ ] Enable SSL certificate

### 15. DNS & Domain
- [ ] Update DNS records
- [ ] Configure SSL certificate
- [ ] Set up www redirect
- [ ] Configure email domain (SPF, DKIM)

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 16. Functional Testing
- [ ] User registration and approval flow
- [ ] Google OAuth login
- [ ] Location switching
- [ ] Product CRUD operations
- [ ] Inventory adjustments (workbench mode)
- [ ] Order completion workflow
- [ ] Reports generation
- [ ] Admin panel access
- [ ] Email notifications

### 17. Security Verification
- [ ] HTTPS redirect working
- [ ] Security headers present (check with securityheaders.com)
- [ ] No sensitive data in responses
- [ ] API rate limiting active
- [ ] CORS properly configured

### 18. Performance Verification
- [ ] Page load times < 3 seconds
- [ ] Database queries < 250ms
- [ ] No memory leaks
- [ ] Proper error handling (no crashes)
- [ ] Check lighthouse scores

### 19. Monitoring Setup
- [ ] Error tracking receiving events
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Log aggregation working
- [ ] Alert notifications configured

---

## 🚨 ROLLBACK PLAN

### If Issues Occur:
1. **Platform Rollback**: Use platform's instant rollback feature
2. **Database**: No schema changes, so no DB rollback needed
3. **DNS**: Keep TTL low (300s) during initial deployment
4. **Communication**: Have user notification plan ready

### Emergency Contacts:
- Database Admin: ___________
- DevOps Lead: ___________
- Product Owner: ___________

---

## 📊 14-Day Monitoring Period

### Week 1 - Daily Checks:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Verify data consistency
- [ ] Monitor resource usage

### Week 2 - Optimization:
- [ ] Address any performance issues
- [ ] Fine-tune rate limits
- [ ] Optimize slow queries
- [ ] Update documentation
- [ ] Plan next improvements

---

## 🎯 Success Criteria

The deployment is considered successful when:
- ✅ All functional tests pass
- ✅ No critical errors in 24 hours
- ✅ Performance meets targets
- ✅ Security scan passes
- ✅ Users can complete core workflows
- ✅ Monitoring and alerts functional
- ✅ Backup/recovery tested

---

## 📝 Notes

- Keep old system in read-only mode for 14 days
- Document any manual interventions required
- Update runbook with lessons learned
- Schedule post-deployment review meeting

**Last Updated**: ${new Date().toISOString()}
**Version**: 1.0.0