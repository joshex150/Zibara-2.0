import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Popup from '@/models/Popup';

// Public GET - fetch popup settings
export async function GET() {
  try {
    await connectDB();
    
    let popup = await Popup.findOne();
    
    // Return default if none exists
    if (!popup) {
      return NextResponse.json({
        success: true,
        popup: {
          enabled: false,
          title: 'SPECIAL ANNOUNCEMENT',
          message: 'Welcome to Crochellaa.ng!',
          showButton: true,
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          showOnce: true,
        },
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
