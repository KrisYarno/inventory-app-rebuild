# Prisma Migration Quick Reference

## Common Migration Commands

### 🔍 Diagnose Issues
```bash
npm run db:diagnose
```
This will check your database connection, migration status, and provide specific recommendations.

### 🆕 Baseline Existing Database
```bash
npm run db:baseline
```
Use this when you have an existing database and want to start using Prisma migrations.

### 📊 Check Migration Status
```bash
npm run db:migrate:status
```

### 🚀 Apply Migrations
```bash
# Development (interactive)
npm run db:migrate

# Production (non-interactive)
npm run db:migrate:deploy
```

### 🔄 Reset Database (Development Only!)
```bash
npm run db:migrate:reset
# WARNING: This will DELETE all data!
```

## Troubleshooting

### Error: "Table 'products' doesn't exist"
This means migrations are trying to modify a table that hasn't been created yet.

**Solution**: Run `npm run db:baseline` to baseline your existing database.

### Error: "Shadow database error"
Prisma needs to create a temporary database for migrations.

**Solution**: Ensure your database user has `CREATE DATABASE` privileges:
```sql
GRANT CREATE ON *.* TO 'your_user'@'localhost';
```

### Error: "Database is out of sync"
Your database doesn't match the expected migration state.

**Solution**:
1. Run `npm run db:diagnose` to understand the issue
2. If you have an existing database: `npm run db:baseline`
3. If starting fresh: `npm run db:migrate:reset` (deletes all data!)

## Best Practices

1. **Always backup before major changes**:
   ```bash
   mysqldump -u user -p database > backup.sql
   ```

2. **Test migrations in development first**

3. **Use semantic migration names**:
   ```bash
   npx prisma migrate dev --name add_user_email_field
   ```

4. **Never edit migration files after they're applied**

5. **For production deployments**:
   ```bash
   # In your deployment script
   npm run db:migrate:deploy
   ```

## Quick Start for New Developers

1. Clone the repository
2. Copy `.env.example` to `.env` and update `DATABASE_URL`
3. Run `npm install`
4. Run `npm run db:diagnose` to check your setup
5. If database exists: `npm run db:baseline`
6. If new database: `npm run db:migrate`
7. Start developing: `npm run dev`