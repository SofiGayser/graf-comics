import prisma from '@/services/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('=== WEBHOOK RECEIVED ===');

  try {
    const webhookData = await request.json();

    console.log('Webhook data:', JSON.stringify(webhookData, null, 2));

    const { event, object } = webhookData;

    if (event === 'payment.succeeded') {
      await handleSuccessfulPayment(object);
    } else if (event === 'payment.waiting_for_capture') {
      console.log('Payment waiting for capture:', object.id);
    } else if (event === 'payment.canceled') {
      console.log('Payment canceled:', object.id);
    } else {
      console.log('Unknown webhook event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(payment: any) {
  const { id, amount, metadata } = payment;

  console.log('💰 Processing successful payment:', id);
  console.log('Amount:', amount.value, amount.currency);
  console.log('Metadata:', metadata);

  try {
    const dbPayment = await prisma.payment.findFirst({
      where: {
        yooPaymentId: id,
        status: { not: 'SUCCEEDED' },
      },
    });

    if (!dbPayment) {
      console.log('Payment not found in database or already processed:', id);

      if (metadata?.paymentId) {
        const paymentById = await prisma.payment.findUnique({
          where: { id: metadata.paymentId },
        });

        if (paymentById) {
          console.log('Found payment by metadata ID:', metadata.paymentId);
          await processPayment(paymentById, amount.value);
          return;
        }
      }

      console.error('❌ Payment not found in database for YooKassa ID:', id);
      return;
    }

    await processPayment(dbPayment, amount.value);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function processPayment(dbPayment: any, amountValue: string) {
  try {
    const amount = parseFloat(amountValue);

    console.log(`💳 Processing payment ${dbPayment.id} for user ${dbPayment.userId}`);
    console.log(`💰 Amount to add: ${amount} RUB`);

    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: 'SUCCEEDED',
        metadata: {
          ...(dbPayment.metadata as any),
          processedAt: new Date().toISOString(),
          webhookReceived: true,
        },
      },
    });

    console.log('✅ Payment status updated to SUCCEEDED');

    const user = await prisma.user.findUnique({
      where: { id: dbPayment.userId },
      select: { balance: true },
    });

    if (!user) {
      console.error('❌ User not found:', dbPayment.userId);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbPayment.userId },
      data: {
        balance: user.balance + amount,
      },
    });

    console.log(`✅ Balance updated for user ${dbPayment.userId}`);
    console.log(`💰 New balance: ${updatedUser.balance} RUB`);

    console.log(
      `🎉 SUCCESS: User ${dbPayment.userId} balance increased by ${amount} RUB. New balance: ${updatedUser.balance} RUB`,
    );
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    throw error;
  }
}
