import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';

// GET all published collections (public)
export async function GET() {
  try {
    await connectDB();
    const collections = await Collection.find({ published: true })
      .populate('productIds')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: collections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
