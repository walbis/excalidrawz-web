import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get search query
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    // Search files across user's workspaces
    const files = await prisma.file.findMany({
      where: {
        AND: [
          {
            group: {
              workspace: {
                members: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                group: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
          {
            inTrash: false,
          },
        ],
      },
      include: {
        group: {
          select: {
            name: true,
            workspace: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50, // Limit results
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
