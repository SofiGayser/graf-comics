import prisma from '@/services/prisma';
import { NextResponse } from 'next/server';

export const GET = async (req: Request, { params }: { params: { id: string; filename: string } }) => {
  try {
    const file = await prisma.responseFile.findFirst({
      where: {
        responseId: params.id,
        filename: params.filename,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new NextResponse(file.data, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Length': file.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
