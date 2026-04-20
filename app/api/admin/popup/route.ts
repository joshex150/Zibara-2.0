import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Popup from '@/models/Popup';

// Admin GET - fetch popup settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let popup = await Popup.findOne();
    
    // Create default if none exists
    if (!popup) {
      popup = await Popup.create({
        enabled: false,
        title: 'SPECIAL ANNOUNCEMENT',
        message: 'Welcome to ZIBARASTUDIO.',
        showButton: true,
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        showOnce: true,
      });
    }
    
    return NextResponse.json({ success: true, popup });
  } catch (error) {
    console.error('Error fetching popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popup' },
      { status: 500 }
    );
  }
}

// Admin PUT - update popup settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    let popup = await Popup.findOne();
    
    if (popup) {
      // Update existing
      popup = await Popup.findByIdAndUpdate(
        popup._id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
    } else {
      // Create new
      popup = await Popup.create(data);
    }
    
    return NextResponse.json({ success: true, popup });
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update popup' },
      { status: 500 }
    );
  }
}
