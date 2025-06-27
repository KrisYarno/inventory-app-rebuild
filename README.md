# Inventory Management System

A modern, ledger-based inventory management system built with Next.js 14, featuring real-time tracking, comprehensive audit trails, and multi-location support.

## 🚀 Features

### Core Functionality
- **Workbench Mode**: Digital order-packer interface for efficient order fulfillment
- **Journal Mode**: Bulk inventory adjustments with visual feedback
- **Multi-Location Support**: Manage inventory across multiple locations
- **Product Management**: Complete CRUD operations with search and filtering
- **Ledger Architecture**: Immutable audit trail for all inventory changes
- **Real-time Analytics**: Comprehensive reports and dashboards

### Technical Highlights
- **Authentication**: NextAuth.js with Google OAuth and credentials
- **Database**: MySQL with Prisma ORM (ledger-based design)
- **UI Framework**: Tailwind CSS + shadcn/ui components  
- **State Management**: Zustand for complex UI state, Context API for location management
- **Type Safety**: TypeScript throughout with strict mode
- **Dark Mode**: Full theme support with system preference detection

## 📦 Getting Started

### Prerequisites
- Node.js 18.17 or later
- MySQL database
- SendGrid account for email notifications (optional)

### Installation

1. Clone the repository:
```bash
cd "inventory app rebuild"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="mysql://user:password@host:port/database?connection_limit=20"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"
```

4. Set up the database:
```bash
# Pull existing schema (if using existing database)
npm run db:pull

# Generate Prisma Client
npm run db:generate

# If starting fresh, run migrations
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Project Structure

```
inventory-app-rebuild/
├── app/                    # Next.js app directory
│   ├── (app)/             # Authenticated app routes
│   │   ├── workbench/     # Order fulfillment interface
│   │   ├── journal/       # Bulk adjustment interface
│   │   ├── products/      # Product management
│   │   ├── inventory/     # Inventory logs
│   │   └── reports/       # Analytics dashboard
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # React components
├── contexts/              # React contexts (location)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── prisma/                # Database schema
├── public/                # Static assets
└── types/                 # TypeScript types
```

## 🔐 Authentication & Authorization

The system uses NextAuth.js for authentication with:
- Google OAuth provider
- Email/password credentials
- Admin approval workflow for new users
- Role-based access control (User/Admin)

### User Roles
- **USER**: Can manage inventory, create orders, view reports
- **ADMIN**: All user permissions plus user management and product CRUD

## 📊 Key Workflows

### Workbench Mode (Order Fulfillment)
1. Select location from the location switcher
2. Search and filter products as needed
3. Click products to add to order
4. Choose quantities with quick picks
5. Enter order reference
6. Complete & deduct from inventory

### Journal Mode (Bulk Adjustments)
1. Select location from the location switcher
2. Search for products
3. Make inline adjustments with +/- controls
4. Review changes summary
5. Submit all changes at once

### Product Management (Admin Only)
- Create products with name, base name, variant structure
- Edit product details
- Soft delete (deactivate) products
- Bulk operations support

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:pull      # Pull schema from database
npm run db:generate  # Generate Prisma Client
npm run db:studio    # Open Prisma Studio
npm run env:check    # Validate environment variables
```

### Database Management
```bash
npx prisma studio     # Open Prisma Studio GUI
npx prisma db pull    # Pull schema from existing database
npx prisma generate   # Generate Prisma Client
```

## 📱 Mobile Support

The application is fully responsive with:
- Touch-optimized interfaces
- Mobile-first design approach
- Adaptive navigation (sidebar on desktop, bottom nav on mobile)
- Swipe gestures in Journal mode
- Large touch targets (44px minimum)

## 🎨 Theming

The app supports light and dark modes with:
- System preference detection
- Manual theme toggle
- Persistent preference storage
- Smooth transitions
- Consistent color tokens across all components

## 🔄 Multi-Location Support

- Switch between locations using the location switcher
- All inventory operations respect the selected location
- Location-specific inventory levels
- Location-based reporting

## 🚢 Deployment

The application is designed for deployment on:
- **Web**: Vercel, Render, or any Node.js hosting
- **Database**: MySQL-compatible services (Railway, PlanetScale, etc.)

Environment variables should be configured in your deployment platform.

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Please follow these guidelines:
1. Use TypeScript with strict mode
2. Follow the existing code style
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

---

Built with Next.js, Prisma, Tailwind CSS, and shadcn/ui