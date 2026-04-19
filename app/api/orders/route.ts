import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

type OrderItemInput = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color?: string;
  image: string;
};

type OrderRequestBody = {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country?: string;
  };
  items: OrderItemInput[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'flutterwave' | 'paystack';
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CRL-${timestamp}-${random}`;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequestBody;

    if (!body?.customer || !body?.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing order details.' },
        { status: 400 }
      );
    }

    await connectDB();

    let orderNumber = generateOrderNumber();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const existing = await Order.findOne({ orderNumber });
      if (!existing) {
        break;
      }
      orderNumber = generateOrderNumber();
    }
    const order = await Order.create({
      orderNumber,
      customer: body.customer,
      items: body.items.map((item) => ({
        productId: mongoose.Types.ObjectId.isValid(item.id) ? item.id : undefined,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
      })),
      subtotal: body.subtotal,
      shipping: body.shipping,
      total: body.total,
      paymentMethod: body.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order._id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
