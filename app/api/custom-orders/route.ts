import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomOrder from '@/models/CustomOrder';

// POST - Create a new custom order request (public)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { firstName, lastName, email, phone, itemType, description } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !itemType || !description) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    const customOrder = await CustomOrder.create(body);

    return NextResponse.json(
      { success: true, data: customOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating custom order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit custom order request' },
      { status: 500 }
    );
  }
}
