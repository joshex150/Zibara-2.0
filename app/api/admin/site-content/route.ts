import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';

// GET all site content
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const key = searchParams.get('key');
    
    let query: any = {};
    if (section) query.section = section;
    if (key) query.key = key;
    
    const content = await SiteContent.find(query).sort({ section: 1, key: 1 });
    
    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create or update site content
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if content with this key already exists
    const existing = await SiteContent.findOne({ key: body.key });
    
    if (existing) {
      // Update existing content
      const updated = await SiteContent.findOneAndUpdate(
        { key: body.key },
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return NextResponse.json({ success: true, data: updated });
    } else {
      // Create new content
      const content = await SiteContent.create(body);
      return NextResponse.json({ success: true, data: content }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
