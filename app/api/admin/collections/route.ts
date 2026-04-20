import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Collection from '@/models/Collection';
import '@/models/Product';

// GET all collections
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const published = searchParams.get('published');
    const slug = searchParams.get('slug');
    
    let query: any = {};
    if (featured) query.featured = featured === 'true';
    if (published) query.published = published === 'true';
    if (slug) query.slug = slug;
    
    const collections = await Collection.find(query)
      .populate('productIds')
      .sort({ year: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: collections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new collection
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate slug from name if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const collection = await Collection.create(body);
    
    return NextResponse.json({ success: true, data: collection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
