# ExcalidrawZ Web

Team-based collaborative whiteboard platform powered by Excalidraw.

## Features

### Core Drawing Features
- **Excalidraw Integration** - Full-featured drawing canvas with all Excalidraw capabilities
- **Auto-Save** - Automatic saving with visual feedback (2-second debounce)
- **Version History** - Automatic checkpoints with restore functionality
- **File Organization** - Hierarchical folder structure (Groups)
- **Import/Export** - Support for .excalidraw, PNG, SVG, PDF formats

### Workspace & Team Management
- **Multi-Workspace Support** - Create and manage multiple workspaces
- **Role-Based Access Control** - Owner, Admin, Member, Viewer roles
- **Team Invitations** - Email-based team member invitations
- **Workspace Settings** - Customize workspace name and manage members

### User Experience
- **Global Search** - Fast file search with keyboard shortcut (⌘K/Ctrl+K)
- **Responsive UI** - Modern, clean interface with Tailwind CSS
- **Dark/Light Export** - Export drawings in light or dark mode
- **File Browser** - Sidebar with collapsible folder tree
- **Recent Files** - Quick access to recently edited files

### Authentication & Security
- **Multiple Auth Providers** - Google, GitHub, Email/Password
- **Secure Sessions** - JWT-based authentication with NextAuth.js
- **Protected Routes** - Server-side session validation
- **Password Hashing** - bcrypt for secure password storage

### Settings & Preferences
- **Profile Management** - Update name, email, password
- **Workspace Settings** - Manage workspace details and statistics
- **Team Management** - Invite, remove, and change member roles
- **Billing Dashboard** - View plans and payment information

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and auth secrets

# Initialize database
npx prisma db push
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
excalidrawz-web/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js 15 App Router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Main app
│   │   └── layout.tsx
│   ├── components/           # React components
│   │   ├── excalidraw/      # Excalidraw wrapper
│   │   ├── sidebar/         # File browser
│   │   └── ui/              # Shared UI components
│   ├── lib/                 # Utilities
│   │   ├── auth.ts          # NextAuth config
│   │   └── prisma.ts        # Prisma client
│   └── types/               # TypeScript types
└── package.json
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js
- **Whiteboard:** Excalidraw

## Features

- ✅ Team workspaces
- ✅ File organization (groups/folders)
- ✅ Version history (checkpoints)
- ✅ Multiple auth providers (Google, GitHub, Email)
- ✅ Role-based access control
- ⏳ Real-time collaboration (coming soon)

## Development

```bash
# Run dev server
npm run dev

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio

# Build for production
npm run build
npm run start
```

## Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel + Supabase

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically on push

## Environment Variables

See `.env.example` for required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL
- OAuth provider credentials (optional)

## License

MIT

## Support

- Issues: [GitHub Issues](https://github.com/walbis/excalidrawz-web/issues)
- Original native app: [ExcalidrawZ](https://github.com/chocoford/ExcalidrawZ)
