import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CustomOrder from '@/models/CustomOrder';

// GET single custom order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const customOrder = await CustomOrder.findById(id);

    if (!customOrder) {
      return NextResponse.json(
        { success: false, error: 'Custom order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customOrder });
  } catch (error) {
    console.error('Error fetching custom order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch custom order' },
      { status: 500 }
    );
  }
}

// PUT update custom order (status, admin notes)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const customOrder = await CustomOrder.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!customOrder) {
      return NextResponse.json(
        { success: false, error: 'Custom order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customOrder });
  } catch (error) {
    console.error('Error updating custom order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update custom order' },
      { status: 500 }
    );
  }
}

// DELETE custom order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const customOrder = await CustomOrder.findByIdAndDelete(id);

    if (!customOrder) {
      return NextResponse.json(
        { success: false, error: 'Custom order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Custom order deleted' });
  } catch (error) {
    console.error('Error deleting custom order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete custom order' },
      { status: 500 }
    );
  }
}
