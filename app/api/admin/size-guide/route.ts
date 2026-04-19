import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SizeGuide from '@/models/SizeGuide';

// GET size guide (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let sizeGuide = await SizeGuide.findOne({});
    
    if (!sizeGuide) {
      // Create default size guide if none exists
      sizeGuide = await SizeGuide.create({
        productMeasurements: [],
        bodyMeasurements: [],
        fitType: 'regular',
        stretch: 'slight',
        measurementTips: [
          'Measure around the fullest part of your bust, keeping the tape parallel to the floor.',
          'Measure around your natural waistline, which is the narrowest part of your torso.',
          'Measure around the fullest part of your hips, keeping the tape parallel to the floor.',
          'For tops: measure from the highest point of your shoulder to your desired length.',
          'Measure from the shoulder seam to your wrist bone with your arm slightly bent.',
        ],
        sizeTips: [
          'If you are between sizes, we recommend sizing up for a more comfortable fit.',
          'Our crochet pieces have slight natural stretch and will mold to your body over time.',
          'Handmade items may have slight variations of 1-2 cm from the listed measurements.',
          'For questions about sizing, please contact us before ordering.',
        ],
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

// PUT update size guide
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    // Find existing or create new
    let sizeGuide = await SizeGuide.findOne({});
    
    if (sizeGuide) {
      // Update existing
      sizeGuide = await SizeGuide.findByIdAndUpdate(
        sizeGuide._id,
        { ...body, updatedAt: new Date() },
        { new: true }
      );
    } else {
      // Create new
      sizeGuide = await SizeGuide.create({ ...body, updatedAt: new Date() });
    }
    
    return NextResponse.json({ success: true, data: sizeGuide });
  } catch (error) {
    console.error('Error updating size guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update size guide' },
      { status: 500 }
    );
  }
}
