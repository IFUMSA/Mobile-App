# IFUMSA Admin Panel

Admin dashboard for managing the IFUMSA mobile app - products, orders, users, announcements, and events.

## Features

- **Dashboard** - Overview stats (orders, products, users, revenue)
- **Orders** - View all orders, verify payments, manage order status
- **Products** - Full CRUD for products/merch
- **Users** - View all registered app users
- **Announcements** - Manage home carousel announcements
- **Events** - Create and manage events
- **Quizzes** - View shared quizzes for moderation

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** components
- **Lucide React** icons

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and update it:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start the backend

Make sure the backend is running with admin emails configured:

```bash
# In Backend/.env add:
ADMIN_EMAILS=admin@ifumsa.com,your-email@example.com
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Admin Authentication

Admin access is controlled via the `ADMIN_EMAILS` environment variable in the backend. Only users whose email is in this list can log into the admin panel.

**Flow:**
1. Admin visits admin panel → redirected to login
2. Logs in with their regular app email/password
3. Backend checks if email is in `ADMIN_EMAILS`
4. If yes → grants admin access

## Payment Verification Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Admin     │     │   User      │
│ Checkout    │────▶│  Verifies   │────▶│ Gets Receipt│
│ + Upload    │     │   Payment   │     │ (Shareable) │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Order Statuses:** `pending` → `submitted` → `confirmed` → `completed`

## Project Structure

```
admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── orders/       # Order management
│   │   │   ├── products/     # Product CRUD
│   │   │   ├── users/        # User list
│   │   │   ├── announcements/# Announcement CRUD
│   │   │   ├── events/       # Event CRUD
│   │   │   ├── quizzes/      # Quiz moderation
│   │   │   └── page.tsx      # Dashboard home
│   │   ├── login/            # Admin login
│   │   └── layout.tsx        # Root layout
│   ├── components/ui/        # shadcn/ui components
│   ├── contexts/             # Auth context
│   ├── hooks/                # Custom hooks
│   └── lib/                  # API client, utilities
├── .env.example
└── package.json
```

## Deployment

Build for production:

```bash
pnpm build
pnpm start
```

Or deploy to Vercel/Netlify with the `NEXT_PUBLIC_API_URL` environment variable set to your production backend URL.
