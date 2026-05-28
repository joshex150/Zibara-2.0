import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderReceipt } from '@/lib/email';

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  zipCode?: string;
};

const isE2ETestMode = () =>
  process.env.E2E_TEST_MODE === '1' && process.env.NODE_ENV !== 'production';

const generateOrderNumber = () =>
  `CRL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

export async function POST(request: NextRequest) {
  if (!isE2ETestMode()) {
    return NextResponse.json(
      { success: false, error: 'Test checkout is disabled.' },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const customer = body.customer as CheckoutCustomer;
    const items = body.items as CheckoutItem[];
    const amount = Number(body.amount);

    if (!customer?.email || !Array.isArray(items) || items.length === 0 || !Number.isFinite(amount)) {
      return NextResponse.json(
        { success: false, error: 'Invalid checkout payload.' },
        { status: 400 },
      );
    }

    await connectDB();

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
    const total = amount || subtotal;
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: {
        ...customer,
        email: customer.email.toLowerCase(),
      },
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
      })),
      subtotal,
      shipping: Math.max(total - subtotal, 0),
      total,
      paymentMethod: 'test',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      transactionId: body.reference || `E2E-${Date.now()}`,
    });

    await sendOrderReceipt({
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items.map((item: CheckoutItem) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
      total: order.total,
      paymentMethod: 'Test Checkout',
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete test checkout.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
