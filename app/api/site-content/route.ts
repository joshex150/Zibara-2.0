import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';

// GET site content (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const key = searchParams.get('key');
    
    let query: any = {};
    if (section) query.section = section;
    if (key) query.key = key;
    
    const content = await SiteContent.find(query);
    
    // Convert to a key-value map for easier access
    const contentMap: Record<string, any> = {};
    content.forEach(item => {
      contentMap[item.key] = item.value;
    });
    
    return NextResponse.json({ 
      success: true, 
      data: content,
      map: contentMap 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
