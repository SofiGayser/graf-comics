// app/api/subscription/debug/route.ts
import prisma from '@/services/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
        benefits: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
