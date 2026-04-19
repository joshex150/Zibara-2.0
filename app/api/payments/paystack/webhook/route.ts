import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderReceipt } from '@/lib/email';

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';
  const expected = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex');

  if (signature !== expected) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const data = payload?.data;

    if (payload?.event !== 'charge.success' || data?.status !== 'success') {
      return NextResponse.json({ success: true });
    }

    await connectDB();
    const order = await Order.findOne({ orderNumber: data.reference });

    if (!order) {
      return NextResponse.json({ success: true });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    order.transactionId = String(data.id ?? '');
    await order.save();

    await sendOrderReceipt({
      orderNumber: order.orderNumber,
      customer: {
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        email: order.customer.email,
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
      total: order.total,
      paymentMethod: 'Paystack',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
