import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const POST = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const formData = await req.formData();
    const message = formData.get('message') as string;
    const files = formData.getAll('files') as File[];

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Вступительное сообщение обязательно' }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Вступительное сообщение должно содержать не менее 10 символов' },
        { status: 400 },
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: 'Разрешены только файлы .doc, .docx, .pdf',
          },
          { status: 400 },
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: 'Максимальный размер файла - 10MB',
          },
          { status: 400 },
        );
      }
    }

    const request = await prisma.collaborationRequest.findUnique({
      where: { id: params.id },
    });

    if (!request) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    const existingResponse = await prisma.collaborationResponse.findFirst({
      where: {
        requestId: params.id,
        userId: session.user.id,
      },
    });

    if (existingResponse) {
      return NextResponse.json({ error: 'Вы уже отправили отклик на эту заявку' }, { status: 400 });
    }

    const response = await prisma.collaborationResponse.create({
      data: {
        requestId: params.id,
        userId: session.user.id,
        roles: [],
        message: message.trim(),
        status: 'PENDING',
      },
    });

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await prisma.responseFile.create({
        data: {
          responseId: response.id,
          filename: file.name,
          mimeType: file.type,
          data: buffer,
          size: file.size,
        },
      });
    }

    const fullResponse = await prisma.collaborationResponse.findUnique({
      where: { id: response.id },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            size: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        request: {
          select: {
            title: true,
            authorId: true,
            author: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log('Response created successfully:', fullResponse.id);

    return NextResponse.json(fullResponse);
  } catch (error) {
    console.error('Ошибка при создании отклика:', error);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера: ' + error.message,
      },
      { status: 500 },
    );
  }
};
