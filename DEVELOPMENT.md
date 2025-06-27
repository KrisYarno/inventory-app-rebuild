# Development Guide

## 🏃 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up database (for existing database)
npm run db:pull
npm run db:generate

# Or for new database
npx prisma migrate dev

# Start development server
npm run dev

# View database
npx prisma studio
```

## 🔑 Key Features Implemented

### 1. Foundation (Sprint 01 ✅)
- Next.js 14 with TypeScript and App Router
- Tailwind CSS with custom design tokens
- Prisma ORM with MySQL (ledger-based schema)
- NextAuth.js authentication (Google OAuth + credentials)
- User approval queue system with email notifications
- shadcn/ui component library
- Responsive AppShell layout
- Dark mode support

### 2. Product Management ✅
- CRUD operations for products
- BaseName + Variant structure
- Image support with fallback
- Admin-only controls
- Search and filtering
- Sort ordering

### 3. Workbench Mode ✅
- Digital order-packer interface
- Quick-add product tiles (no images, centered text)
- Visual product grouping
- Quantity picker (1-5 + custom)
- Order list management
- Complete & deduct functionality
- Stock level indicators
- Search and filter functionality
- Stock status filters (in stock, low stock, out of stock)

### 4. Journal Mode ✅
- Bulk inventory adjustments
- Inline quantity editing
- Visual change indicators
- Review changes dialog
- Auto-save to localStorage
- Mobile swipe gestures
- Notes/reasons for adjustments

### 5. Inventory Ledger System ✅
- Immutable transaction log
- Complete audit trail
- Point-in-time snapshots
- Transaction grouping
- Stock validation
- Multiple change types (SALE, ADJUSTMENT, STOCK_IN)

### 6. Reports & Analytics ✅
- Dashboard with key metrics
- Activity timeline
- Product performance charts
- User activity summaries
- Low stock alerts
- Interactive data visualizations

### 7. Multi-Location Support ✅
- Location switcher in sidebar
- Location-aware inventory tracking
- All operations respect selected location
- Location persists across sessions
- product_locations table for per-location inventory

## 📁 Project Structure

```
app/
├── (app)/              # Authenticated routes with AppShell
│   ├── workbench/      # Main inventory interface
│   ├── journal/        # Bulk adjustments
│   ├── products/       # Product management
│   ├── inventory/      # Ledger logs view
│   ├── reports/        # Analytics
│   └── admin/          # Admin functions
├── api/                # API endpoints
│   ├── auth/           # NextAuth routes
│   ├── products/       # Product CRUD
│   ├── inventory/      # Ledger operations
│   └── reports/        # Analytics data
└── auth/               # Auth pages

components/
├── ui/                 # shadcn/ui components
├── layout/             # AppShell, navigation, location switcher
├── products/           # Product components
├── workbench/          # Workbench UI
├── journal/            # Journal UI
├── inventory/          # Inventory displays
└── reports/            # Charts and metrics

contexts/
└── location-context.tsx # Location state management

lib/
├── auth.ts             # Auth configuration
├── prisma.ts           # Database client
├── products.ts         # Product utilities
├── inventory.ts        # Ledger operations
└── email.ts            # SendGrid integration

types/
├── next-auth.d.ts      # Auth type extensions
├── product.ts          # Product types
├── inventory.ts        # Inventory types
├── workbench.ts        # Workbench types
└── reports.ts          # Report types
```

## 🔧 Configuration Files

### Environment Variables
See `.env.example` for all required variables:
- Database connection
- NextAuth configuration
- Google OAuth credentials
- SendGrid API key

### TypeScript Config
Strict mode enabled with path aliases:
- `@/*` → root directory
- `@/components/*` → components
- `@/lib/*` → lib
- `@/hooks/*` → hooks
- `@/types/*` → types

### Tailwind Config
Custom design tokens integrated:
- Color system with CSS variables
- Typography scale
- Spacing based on 4px unit
- Custom animations
- Component-specific tokens

## 🚀 API Endpoints

### Authentication
- `GET/POST /api/auth/*` - NextAuth endpoints

### Products
- `GET /api/products` - List with filters
- `GET /api/products/[id]` - Single product
- `POST /api/products` - Create (Admin)
- `PUT /api/products/[id]` - Update (Admin)
- `DELETE /api/products/[id]` - Soft delete (Admin)

### Inventory
- `GET /api/inventory/logs` - Ledger entries
- `GET /api/inventory/current` - Current levels by location
- `POST /api/inventory/deduct-simple` - Order deduction
- `POST /api/inventory/adjust` - Manual adjustment
- `POST /api/inventory/stock-in` - Add stock

### Locations
- `GET /api/locations` - List all locations

### Reports
- `GET /api/reports/metrics` - Key metrics
- `GET /api/reports/activity` - Timeline
- `GET /api/reports/low-stock` - Alerts
- `GET /api/reports/user-activity` - User stats

### Admin
- `GET /api/admin/users` - User list
- `POST /api/admin/users/[id]/approve` - Approve user
- `DELETE /api/admin/users/[id]/reject` - Reject user

## 🎨 UI Components

### Core Components
- `AppShell` - Main layout wrapper
- `ProductCard` - Product display
- `QuantityPicker` - Quantity selection
- `StockLevelBadge` - Stock indicators
- `ThemeToggle` - Dark mode switch

### Workbench Components
- `ProductTile` - Quick-add buttons
- `OrderList` - Current order display
- `CompleteOrderDialog` - Confirmation

### Journal Components
- `JournalProductRow` - Adjustment row
- `AdjustmentInput` - Quantity input
- `ReviewChangesDialog` - Confirmation

### Report Components
- `MetricsCard` - KPI display
- `ActivityTimeline` - Event stream
- `InventoryChart` - Data visualization

## 🧪 Testing Approach

The project is ready for testing implementation:
- Component testing with React Testing Library
- API route testing with Jest
- E2E testing with Playwright
- Database testing with test utilities

## 🚦 State Management

### Zustand Stores
- `useWorkbench` - Workbench order state
- `useJournal` - Journal adjustment state

### Context API
- `LocationContext` - Selected location state
- Persists to localStorage
- Updates all inventory queries

Both stores include:
- Persist middleware for localStorage
- Computed values
- Action methods
- TypeScript types

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- API route protection
- Input validation
- SQL injection prevention (Prisma)
- XSS protection (React)
- Environment variable security

## 📱 Mobile Features

- Responsive design (mobile-first)
- Touch-optimized interfaces
- Bottom navigation on mobile
- Swipe gestures in Journal
- Large touch targets
- Progressive enhancement

## 🎯 Next Steps

Potential enhancements:
1. Transfer workflow implementation (between locations)
2. Barcode scanning support
3. CSV import/export functionality
4. Advanced reporting filters
5. Offline capability with sync
6. Real-time collaboration
7. Automated testing suite
8. Performance monitoring
9. Advanced search features
10. Inventory forecasting

---

For more detailed documentation, see the `/please read docs` folder.