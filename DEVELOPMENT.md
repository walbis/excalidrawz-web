# Development Guide

## Initial Setup Complete ✅

The ExcalidrawZ Web project scaffold is now ready! Here's what has been built:

### ✅ Completed Components

1. **Project Structure**
   - Next.js 15 with App Router
   - TypeScript configuration
   - Tailwind CSS styling
   - Prisma ORM with PostgreSQL

2. **Database Schema**
   - User & Authentication tables (NextAuth)
   - Workspace (team-based organization)
   - WorkspaceMember (role-based access)
   - Group (folder hierarchy)
   - File (Excalidraw documents)
   - FileCheckpoint (version history)

3. **Authentication**
   - NextAuth.js configured
   - Google OAuth support
   - GitHub OAuth support
   - Email/Password credentials
   - Session management

4. **API Routes** (Complete CRUD)
   - `/api/auth/[...nextauth]` - Authentication
   - `/api/workspaces` - Workspace management
   - `/api/groups` - Folder/group management
   - `/api/files` - File CRUD with checkpoints

5. **Components**
   - `ExcalidrawWrapper` - Excalidraw integration with auto-save
   - Landing page
   - Provider setup (React Query, NextAuth)

## Next Steps 🚀

### 1. Install Dependencies

```bash
cd /Users/berkaysisli/Projects/excalidrawz-web
npm install
```

### 2. Setup Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql@16  # macOS
brew services start postgresql@16

# Create database
createdb excalidrawz

# Update .env
cp .env.example .env
# Edit: DATABASE_URL="postgresql://localhost:5432/excalidrawz"
```

**Option B: Docker (Recommended)**
```bash
# Start PostgreSQL container
docker run --name excalidrawz-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=excalidrawz \
  -p 5432:5432 \
  -d postgres:16

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/excalidrawz"
```

**Option C: Cloud (Easiest)**

Use [Supabase](https://supabase.com) or [Neon](https://neon.tech):
1. Create free PostgreSQL database
2. Copy connection string to `.env`

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Configure Authentication

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

Add to `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

**Optional: OAuth Providers**

Google:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

GitHub:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Add to `.env`:
   ```
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."
   ```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Building the UI 🎨

Now you need to create:

### Priority 1: Authentication Pages

```bash
mkdir -p src/app/auth/signin
mkdir -p src/app/auth/signup
```

Create `src/app/auth/signin/page.tsx`:
```tsx
'use client';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <button
          onClick={() => signIn('google')}
          className="w-full bg-white border py-2 rounded-lg"
        >
          Sign in with Google
        </button>
        <button
          onClick={() => signIn('github')}
          className="w-full bg-gray-900 text-white py-2 rounded-lg"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
```

### Priority 2: Dashboard Layout

```bash
mkdir -p src/app/dashboard
```

Create `src/app/dashboard/layout.tsx`:
```tsx
'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">ExcalidrawZ</h2>
        {/* Add workspace/file navigation here */}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### Priority 3: File Editor Page

Create `src/app/dashboard/files/[id]/page.tsx`:
```tsx
'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ExcalidrawWrapper } from '@/components/excalidraw/excalidraw-wrapper';

export default function FilePage({ params }: { params: { id: string } }) {
  const { data: file } = useQuery({
    queryKey: ['file', params.id],
    queryFn: () => fetch(`/api/files/${params.id}`).then(r => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/files/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data }),
      }),
  });

  if (!file) return <div>Loading...</div>;

  return (
    <div className="h-screen">
      <ExcalidrawWrapper
        fileId={params.id}
        initialData={file.content}
        onSave={async (data) => {
          await saveMutation.mutateAsync(data);
        }}
      />
    </div>
  );
}
```

## Deployment Options 🚀

### Option 1: Railway (Easiest)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

Add environment variables in Railway dashboard.

### Option 2: Vercel + Supabase

1. **Setup Supabase:**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Copy database connection string

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```
   - Connect to GitHub repo
   - Add environment variables
   - Auto-deploy on git push

### Option 3: Docker + Kubernetes

See `docker-compose.yml` for local containerized setup.

For Kubernetes deployment, use the manifests in `k8s/` (create these based on your needs).

## Testing the APIs 🧪

### Create a Workspace

```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name": "My Team"}'
```

### Create a Group

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Projects", "workspaceId": "..."}'
```

### Create a File

```bash
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Drawing",
    "groupId": "...",
    "content": {"elements": [], "appState": {}}
  }'
```

## Project Structure

```
excalidrawz-web/
├── prisma/
│   └── schema.prisma           # Database models
├── src/
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── files/         # File CRUD
│   │   │   ├── workspaces/    # Workspace management
│   │   │   └── groups/        # Group/folder management
│   │   ├── auth/              # Auth pages (TODO)
│   │   ├── dashboard/         # Main app (TODO)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── providers.tsx      # React Query & NextAuth
│   ├── components/
│   │   └── excalidraw/        # Excalidraw wrapper
│   ├── lib/
│   │   ├── auth.ts            # Auth config
│   │   └── prisma.ts          # DB client
│   └── types/                 # TypeScript types
├── .env                       # Environment variables
├── package.json
└── README.md
```

## Common Issues & Solutions

### Database Connection Failed
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Try: `npx prisma db push --skip-generate`

### NextAuth Session Not Working
- Check NEXTAUTH_SECRET is set
- Clear cookies: `document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));`

### Excalidraw Not Loading
- Check browser console for errors
- Ensure `@excalidraw/excalidraw` is installed
- Try clearing `.next/` cache: `rm -rf .next`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Excalidraw Documentation](https://docs.excalidraw.com)
- [React Query Documentation](https://tanstack.com/query/latest)

## Support

- GitHub Repo: https://github.com/walbis/excalidrawz-web
- Original Swift App: https://github.com/chocoford/ExcalidrawZ
- Excalidraw: https://github.com/excalidraw/excalidraw
