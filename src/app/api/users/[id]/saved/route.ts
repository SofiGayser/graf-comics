import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedRequests = await prisma.savedCollaborationRequests.findMany({
      where: { userId: params.id },
      select: { requestId: true },
    });

    return NextResponse.json(savedRequests);
  } catch (error) {
    console.error('Error fetching saved requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Проверяем, существует ли запрос
    const requestExists = await prisma.collaborationRequest.findUnique({
      where: { id: requestId },
    });
    if (!requestExists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Проверяем, не сохранен ли уже
    const existing = await prisma.savedCollaborationRequests.findFirst({
      where: { userId: params.id, requestId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already saved' }, { status: 400 });
    }

    const saved = await prisma.savedCollaborationRequests.create({
      data: {
        userId: params.id,
        requestId,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error saving request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    await prisma.savedCollaborationRequests.deleteMany({
      where: { userId: params.id, requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
