import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions);
  const { requestId, role, message } = await req.json();

  const response = await prisma.collaborationResponse.create({
    data: {
      requestId,
      userId: session.user.id,
      roles: role,
      message,
    },
  });

  return NextResponse.json(response);
};
