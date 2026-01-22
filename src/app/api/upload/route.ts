// src/app/api/upload/route.ts
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { mkdir, writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { join } from 'path';

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Валидация файла
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем папку если не существует
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'responses');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log('Uploads directory already exists');
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${session.user.id}_${timestamp}_${randomString}.${fileExtension}`;
    const path = join(uploadsDir, filename);

    await writeFile(path, buffer);

    // Возвращаем абсолютный URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/responses/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
};
