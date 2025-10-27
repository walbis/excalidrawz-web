# ExcalidrawZ Web

Team-based collaborative whiteboard platform powered by Excalidraw.

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
