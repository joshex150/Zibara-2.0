import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CustomOrder from '@/models/CustomOrder';

// GET all custom orders (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const customOrders = await CustomOrder.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: customOrders });
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch custom orders' },
      { status: 500 }
    );
  }
}
