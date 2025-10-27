import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify user has access to this file
    const file = await prisma.file.findFirst({
      where: {
        id: params.id,
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
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get all checkpoints for this file
    const checkpoints = await prisma.fileCheckpoint.findMany({
      where: {
        fileId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json(checkpoints);
  } catch (error) {
    console.error('Error fetching checkpoints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Restore a checkpoint
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await request.json();
    const { checkpointId } = body;

    if (!checkpointId) {
      return NextResponse.json({ error: 'Checkpoint ID is required' }, { status: 400 });
    }

    // Verify user has access to this file
    const file = await prisma.file.findFirst({
      where: {
        id: params.id,
        group: {
          workspace: {
            members: {
              some: {
                userId: user.id,
                role: {
                  in: ['OWNER', 'ADMIN', 'MEMBER'],
                },
              },
            },
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found or insufficient permissions' }, { status: 404 });
    }

    // Get the checkpoint
    const checkpoint = await prisma.fileCheckpoint.findUnique({
      where: { id: checkpointId },
    });

    if (!checkpoint || checkpoint.fileId !== params.id) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });
    }

    // Create a new checkpoint with current content before restoring
    await prisma.fileCheckpoint.create({
      data: {
        fileId: params.id,
        content: file.content,
      },
    });

    // Restore the checkpoint content to the file
    const updatedFile = await prisma.file.update({
      where: { id: params.id },
      data: {
        content: checkpoint.content,
      },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error restoring checkpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
