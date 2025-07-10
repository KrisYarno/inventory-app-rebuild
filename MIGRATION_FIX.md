# Prisma Migration Fix Guide

## Problem
The Prisma migration is failing because it's trying to apply migrations that reference a `products` table that doesn't exist in the shadow database. This typically happens when:
1. Migrations were created manually without using Prisma's migration system
2. The database already has tables but Prisma doesn't know about their creation history
3. Migration files are missing or out of order

## Solution Options

### Option 1: Baseline the Current Database (Recommended for existing databases)

If your database already has the tables and you want to start fresh with Prisma migrations:

```bash
# 1. First, ensure your database is backed up
mysqldump -u your_user -p your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Delete the existing migrations folder (keep a backup)
mv prisma/migrations prisma/migrations_backup_$(date +%Y%m%d_%H%M%S)

# 3. Create a new migration from the current database state
npx prisma migrate dev --name init --create-only

# 4. Mark this migration as already applied (since tables already exist)
npx prisma migrate resolve --applied "init"

# 5. Now you can create new migrations normally
npx prisma migrate dev
```

### Option 2: Reset and Rebuild (For development environments only)

**WARNING**: This will DELETE all data in your database!

```bash
# 1. Reset the database completely
npx prisma migrate reset

# This will:
# - Drop the database
# - Create a new database
# - Apply all migrations in order
# - Run seed scripts
```

### Option 3: Fix Missing Initial Migration

If you're missing the initial migration that creates the products table:

```bash
# 1. Create a new initial migration file
mkdir -p prisma/migrations/00000000000000_init

# 2. Create the migration SQL file
cat > prisma/migrations/00000000000000_init/migration.sql << 'EOF'
-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `baseName` VARCHAR(150) NULL,
    `variant` VARCHAR(100) NULL,
    `unit` VARCHAR(20) NULL,
    `numericValue` DECIMAL(10, 2) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `location` INTEGER NOT NULL DEFAULT 1,
    `lowStockThreshold` INTEGER NULL DEFAULT 1,
    `wooProductId` INTEGER NULL,
    `wooVariationId` INTEGER NOT NULL DEFAULT 0,
    `wooSku` VARCHAR(255) NULL,
    `lastWooSync` DATETIME(0) NULL,
    `sku` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `products_wooProductId_key`(`wooProductId`),
    UNIQUE INDEX `products_wooSku_key`(`wooSku`),
    UNIQUE INDEX `unique_woo_product_variation`(`wooProductId`, `wooVariationId`),
    INDEX `idx_product_sorting`(`baseName`, `numericValue`, `variant`),
    INDEX `idx_products_name_fulltext`(`name`),
    INDEX `idx_products_baseName_fulltext`(`baseName`),
    INDEX `idx_products_variant_fulltext`(`variant`),
    INDEX `idx_products_search_composite`(`baseName`, `variant`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable (other required tables)
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `email` VARCHAR(255) NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `defaultLocationId` INTEGER NOT NULL DEFAULT 1,
    `emailAlerts` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `email`(`email`),
    INDEX `fk_user_default_location`(`defaultLocationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `locations` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints after all tables are created
ALTER TABLE `users` ADD CONSTRAINT `fk_user_default_location` FOREIGN KEY (`defaultLocationId`) REFERENCES `locations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
EOF

# 3. Apply this migration
npx prisma migrate deploy
```

### Option 4: Manual Shadow Database Fix (Advanced)

If you need to manually fix the shadow database:

```bash
# 1. Get your shadow database URL (Prisma creates one automatically)
# It's usually your DATABASE_URL with "_shadow" appended to the database name

# 2. Connect to the shadow database and create the missing table
mysql -u your_user -p your_database_shadow << 'EOF'
CREATE TABLE IF NOT EXISTS `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);
EOF

# 3. Retry the migration
npx prisma migrate dev
```

## Recommended Approach

Based on your situation where you have an existing database with tables already created:

1. **Backup your database first**
2. Use **Option 1 (Baseline)** to start fresh with Prisma migrations
3. This will preserve your existing data while allowing you to use Prisma migrations going forward

## Troubleshooting Commands

```bash
# Check current migration status
npx prisma migrate status

# View detailed migration errors
npx prisma migrate dev --skip-generate

# Generate Prisma client without running migrations
npx prisma generate

# Introspect existing database to update schema.prisma
npx prisma db pull
```

## Prevention

To avoid this issue in the future:
1. Always use `npx prisma migrate dev` to create migrations
2. Never manually create migration files without the full table definitions
3. Keep migrations in version control and apply them in order
4. Use `prisma db push` only for rapid prototyping, not for production changes