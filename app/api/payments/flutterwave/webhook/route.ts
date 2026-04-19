import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderReceipt } from '@/lib/email';

export async function POST(request: NextRequest) {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = request.headers.get('verif-hash');

  if (!secretHash || !signature || signature !== secretHash) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const data = payload?.data;

    if (data?.status !== 'successful' || !data?.tx_ref) {
      return NextResponse.json({ success: true });
    }

    await connectDB();
    const order = await Order.findOne({ orderNumber: data.tx_ref });

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
      paymentMethod: 'Flutterwave',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
