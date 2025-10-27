import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/files/[id] - Get a single file
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id: params.id },
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
        },
        checkpoints: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permission
    if (file.group.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error(`GET /api/files/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/files/[id] - Update a file
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, content, groupId } = body;

    // Check permission
    const existingFile = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        group: {
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
        },
      },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (existingFile.group.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create checkpoint before updating
    if (content) {
      await prisma.fileCheckpoint.create({
        data: {
          fileId: params.id,
          content: existingFile.content,
        },
      });
    }

    // Update file
    const updatedFile = await prisma.file.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(content && { content }),
        ...(groupId && { groupId }),
        updatedAt: new Date(),
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

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error(`PATCH /api/files/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/files/[id] - Move file to trash
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        group: {
          include: {
            workspace: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                    role: {
                      in: ['OWNER', 'ADMIN'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (file.group.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Soft delete (move to trash)
    const deletedFile = await prisma.file.update({
      where: { id: params.id },
      data: {
        inTrash: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(deletedFile);
  } catch (error) {
    console.error(`DELETE /api/files/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
