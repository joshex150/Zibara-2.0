import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

type TrackRequestBody = {
  orderNumber: string;
  email: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackRequestBody;
    const orderNumber = body?.orderNumber?.trim();
    const email = body?.email?.trim()?.toLowerCase();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Order number and email are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      orderNumber,
      'customer.email': email,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
