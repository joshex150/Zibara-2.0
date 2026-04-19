import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderReceipt } from '@/lib/email';

type VerifyRequestBody = {
  transactionId: string;
  txRef?: string;
  amount: number;
  customer: any;
  items: any[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyRequestBody;
    const { transactionId, txRef, amount, customer, items } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing transaction details.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Flutterwave secret key not configured.' },
        { status: 500 }
      );
    }

    // Verify payment with Flutterwave using secret key
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const payload = await response.json();

    if (payload?.status !== 'success' || payload?.data?.status !== 'successful') {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 10;
    const total = subtotal + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create order after successful payment verification (like jeel)
    const order = await Order.create({
      orderNumber,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        country: customer.country || '',
        zipCode: customer.zipCode || '',
      },
      items: items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
      })),
      subtotal,
      shipping,
      total,
      paymentMethod: 'flutterwave',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      transactionId: String(payload.data.id),
    });

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

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
