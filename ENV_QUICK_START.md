# 🚀 Environment Setup Quick Start

## First Time Setup (5 minutes)

### 1. Copy Environment File
```bash
cp .env.development.example .env.local
```

### 2. Generate NextAuth Secret
```bash
openssl rand -base64 32
# Copy the output to NEXTAUTH_SECRET in .env.local
```

### 3. Set Database Connection
```bash
# Edit .env.local and update DATABASE_URL
# For read-only access to live DB:
DATABASE_URL="mysql://readonly_user:password@prod-server:3306/inventory?connection_limit=2"
```

### 4. Configure OAuth (Optional for Dev)
For local development without Google OAuth:
```bash
GOOGLE_CLIENT_ID="development-placeholder"
GOOGLE_CLIENT_SECRET="development-placeholder"
```

### 5. Configure Email (Optional for Dev)
For local development without emails:
```bash
SENDGRID_API_KEY="fake-key-for-local-dev"
FROM_EMAIL="dev@localhost"
```

### 6. Sync Database Schema
```bash
# Pull schema from existing database (read-only)
npm run db:pull

# Generate Prisma client
npm run db:generate
```

### 7. Verify Setup
```bash
npm run env:check
```

### 8. Start Development
```bash
npm run dev
```

## Environment Commands

| Command | Description |
|---------|-------------|
| `npm run env:check` | Verify all required env vars are set |
| `npm run env:validate` | Interactive env setup wizard |
| `npm run db:pull` | Sync schema from database (read-only) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Browse database (read-only mode) |
| `npm run dev` | Start development server |
| `npm run dev:prod-readonly` | Dev with production DB (read-only) |

## Common Issues & Fixes

### 🔴 Missing Environment Variables
```bash
npm run env:check
# Follow the output to see what's missing
```

### 🔴 Database Connection Failed
```bash
# Test connection with mysql CLI
mysql -h HOST -P PORT -u USER -p DATABASE

# Check your DATABASE_URL format
# Ensure no spaces and proper URL encoding
```

### 🔴 NextAuth Secret Error
```bash
# Generate a new secret
openssl rand -base64 32
# Update NEXTAUTH_SECRET in .env.local
```

### 🔴 Google OAuth Not Working
For local dev, use email/password login instead or:
1. Create OAuth app at https://console.cloud.google.com
2. Add `http://localhost:3000/api/auth/callback/google` to redirect URIs
3. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

## Security Reminders

⚠️ **NEVER**:
- Commit `.env.local` or `.env.production`
- Use production credentials in development
- Run migrations on the live database
- Share your NextAuth secret

✅ **ALWAYS**:
- Use read-only DB users for development
- Generate unique secrets per environment
- Keep production credentials in a password manager
- Review changes before connecting to production

## Need Help?

1. Check the full guide: `docs/CONFIGURATION.md`
2. Database connection help: `docs/DATABASE_CONNECTION.md`
3. Run validation wizard: `npm run env:validate`
4. Check example files: `.env.development.example`, `.env.production.example`