import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default workspace
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        workspaces: {
          create: {
            workspace: {
              create: {
                name: `${name}'s Workspace`,
                slug: email.split('@')[0] + '-workspace',
                groups: {
                  create: {
                    name: 'Getting Started',
                  },
                },
              },
            },
            role: 'OWNER',
          },
        },
      },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
