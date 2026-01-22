import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string; requestId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const request = await prisma.collaborationRequest.findUnique({
      where: { id: params.requestId },
    });

    if (!request) {
      return NextResponse.json({ error: 'Collaboration request not found' }, { status: 404 });
    }

    const existing = await prisma.savedCollaborationRequests.findFirst({
      where: {
        userId,
        requestId: params.requestId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already saved' }, { status: 400 });
    }

    const saved = await prisma.savedCollaborationRequests.create({
      data: {
        userId,
        requestId: params.requestId,
      },
      include: {
        request: true,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; requestId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.savedCollaborationRequests.deleteMany({
      where: {
        userId: params.id,
        requestId: params.requestId,
      },
    });

    return NextResponse.json({ success: true, message: 'Request removed from saved' });
  } catch (error) {
    console.error('Error removing saved request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string; requestId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saved = await prisma.savedCollaborationRequests.findFirst({
      where: {
        userId: params.id,
        requestId: params.requestId,
      },
    });

    return NextResponse.json({ isSaved: !!saved });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
