import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/files - List all files in a workspace
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    const groupId = searchParams.get('groupId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    // Check if user is a member of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const files = await prisma.file.findMany({
      where: {
        group: {
          workspaceId,
        },
        ...(groupId && { groupId }),
        inTrash: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('GET /api/files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/files - Create a new file
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, groupId, content } = body;

    if (!name || !groupId) {
      return NextResponse.json(
        { error: 'name and groupId required' },
        { status: 400 }
      );
    }

    // Check if user has access to the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!group || group.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create file with empty Excalidraw content
    const file = await prisma.file.create({
      data: {
        name,
        groupId,
        authorId: session.user.id,
        content: content || {
          elements: [],
          appState: {
            viewBackgroundColor: '#ffffff',
          },
          files: {},
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('POST /api/files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
