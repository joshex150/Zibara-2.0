import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrencyRate from '@/models/CurrencyRate';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Only fetch active currencies that admin has declared in the database
    const rates = await CurrencyRate.find({ isActive: true }).sort({ code: 1 });
    
    // Return only currencies from database (no defaults)
    // If admin hasn't set up any currencies yet, return empty array
    // The frontend will handle fallback to defaults if needed
    return NextResponse.json({
      success: true,
      rates: rates.map(rate => ({
        code: rate.code,
        name: rate.name,
        symbol: rate.symbol,
        rate: rate.rate,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching currency rates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
