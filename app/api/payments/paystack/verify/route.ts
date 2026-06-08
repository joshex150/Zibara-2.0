import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import CurrencyRate from '@/models/CurrencyRate';
import { sendOrderReceipt } from '@/lib/email';

type VerifyRequestBody = {
  reference: string;
  amount: number;
  currency?: string;
  customer: any;
  items: any[];
};

const getCurrencyRate = async (currencyCode: string) => {
  if (currencyCode === 'USD') return 1;
  const rate = await CurrencyRate.findOne({ code: currencyCode, isActive: true });
  return rate?.rate || (currencyCode === 'NGN' ? 1500 : null);
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyRequestBody;
    const { reference, currency = 'USD', customer, items } = body;
    const normalizedCurrency = currency.toUpperCase();

    if (!reference || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing order details.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Paystack secret key not configured.' },
        { status: 500 }
      );
    }

    // Verify payment with Paystack using secret key
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const payload = await response.json();

    if (!payload?.status || payload?.data?.status !== 'success') {
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
    const currencyRate = await getCurrencyRate(normalizedCurrency);

    if (!currencyRate) {
      return NextResponse.json(
        { success: false, error: 'Unsupported payment currency.' },
        { status: 400 }
      );
    }

    const paidCurrency = String(payload.data.currency || '').toUpperCase();
    const paidAmount = Number(payload.data.amount) / 100;
    const expectedAmount = Number((total * currencyRate).toFixed(2));

    if (paidCurrency !== normalizedCurrency || Math.abs(paidAmount - expectedAmount) > 1) {
      return NextResponse.json(
        { success: false, error: 'Payment amount or currency mismatch.' },
        { status: 400 }
      );
    }

    const existingOrder = await Order.findOne({ orderNumber: reference });
    if (existingOrder) {
      return NextResponse.json({ success: true, data: existingOrder });
    }

    // Create order after successful payment verification (like jeel)
    const order = await Order.create({
      orderNumber: reference,
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
      paymentMethod: 'paystack',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      transactionId: String(payload.data.id),
    });

    const emailResult = await sendOrderReceipt({
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
    }).catch((err) => {
      console.error('[email] receipt failed for', order.orderNumber, err);
      return { error: err instanceof Error ? err.message : String(err) };
    });
    console.log('[email] receipt result for', order.orderNumber, emailResult);

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
