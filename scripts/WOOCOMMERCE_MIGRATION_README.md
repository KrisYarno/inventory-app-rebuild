# WooCommerce Migration Guide

This document explains how to apply the WooCommerce integration database migration.

## Prerequisites

1. **Database Backup**: Always create a full database backup before running migrations
2. **Environment Setup**: Ensure your `.env.local` file has the correct `DATABASE_URL`
3. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

## Running the Migration

### Method 1: Using npm script (Recommended)
```bash
npm run migrate:woocommerce
```

### Method 2: Direct execution
```bash
node scripts/apply-woocommerce-migration.js
```

## What the Migration Does

The migration script will:

1. **Create `woocommerce_products` table**
   - Stores WooCommerce product mappings
   - Links WooCommerce products to internal inventory products
   - Includes indexes for performance

2. **Add columns to `products` table**
   - `sku`: For storing product SKU codes
   - `isActive`: For soft-delete functionality

3. **Update `audit_logs` table**
   - Modify `entityId` to support string values
   - Add `metadata` JSON column for additional data

## Safety Features

The migration script includes:

- **Pre-flight checks**: Verifies if migration has already been applied
- **Backup reminder**: Prompts for backup confirmation before proceeding
- **Transaction support**: All changes are applied in a transaction
- **Rollback capability**: If any step fails, all changes are rolled back
- **Clear progress updates**: Shows what's being done at each step

## Manual Rollback

If you need to manually rollback the migration, run these SQL commands:

```sql
-- Remove woocommerce_products table
DROP TABLE IF EXISTS `woocommerce_products`;

-- Remove columns from products table
ALTER TABLE `products` DROP COLUMN `sku`;
ALTER TABLE `products` DROP COLUMN `isActive`;

-- Remove metadata column from audit_logs
ALTER TABLE `audit_logs` DROP COLUMN `metadata`;

-- Revert entityId column type (if needed)
ALTER TABLE `audit_logs` MODIFY COLUMN `entityId` INT;
```

## After Migration

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Verify Schema Sync**:
   ```bash
   npx prisma db pull
   ```
   Compare the pulled schema with your `prisma/schema.prisma` file

3. **Test the Application**:
   - Check that existing functionality still works
   - Test WooCommerce-related features if implemented

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` is correct in `.env.local`
- Check database server is running and accessible
- Ensure user has necessary permissions (CREATE, ALTER, DROP)

### Migration Already Applied
- The script will detect if changes have already been applied
- It's safe to run multiple times - it won't duplicate changes

### Permission Errors
- Ensure database user has DDL (Data Definition Language) permissions
- Contact your database administrator if needed

## Support

If you encounter issues:
1. Check the error message carefully
2. Review the rollback instructions
3. Restore from backup if necessary
4. Check the migration SQL in `/prisma/migrations/add_woocommerce_products_table.sql`