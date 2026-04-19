import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SizeGuide from '@/models/SizeGuide';

// GET size guide (public)
export async function GET() {
  try {
    await connectDB();
    
    // Get the single size guide document (there's only one)
    let sizeGuide = await SizeGuide.findOne({});
    
    // If no size guide exists, return default structure
    if (!sizeGuide) {
      return NextResponse.json({
        success: true,
        data: {
          productMeasurements: [],
          bodyMeasurements: [],
          fitType: 'regular',
          stretch: 'slight',
          measurementTips: [],
          sizeTips: [],
        },
      });
    }
    
    return NextResponse.json({ success: true, data: sizeGuide });
  } catch (error) {
    console.error('Error fetching size guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch size guide' },
      { status: 500 }
    );
  }
}
