import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions);
  const { title, description, cover, roles, genres, tags } = await req.json();

  const request = await prisma.collaborationRequest.create({
    data: {
      title,
      description,
      cover,
      roles,
      genres,
      tags,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(request);
};

export const GET = async () => {
  const requests = await prisma.collaborationRequest.findMany({
    include: {
      author: { select: { name: true, avatar: true } },
      responses: true,
    },
  });
  return NextResponse.json(requests);
};
