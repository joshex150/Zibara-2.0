import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrencyRate from '@/models/CurrencyRate';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const rates = await CurrencyRate.find().sort({ code: 1 });
    
    return NextResponse.json({
      success: true,
      rates: rates.map(rate => ({
        _id: rate._id.toString(),
        code: rate.code,
        name: rate.name,
        symbol: rate.symbol,
        rate: rate.rate,
        isActive: rate.isActive,
        createdAt: rate.createdAt,
        updatedAt: rate.updatedAt,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, symbol, rate, isActive } = body;

    if (!code || !name || !symbol || rate === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if currency already exists
    const existing = await CurrencyRate.findOne({ code: code.toUpperCase() });
    
    if (existing) {
      // Update existing currency
      existing.name = name;
      existing.symbol = symbol;
      existing.rate = rate;
      existing.isActive = isActive !== undefined ? isActive : existing.isActive;
      await existing.save();

      return NextResponse.json({
        success: true,
        rate: {
          _id: existing._id.toString(),
          code: existing.code,
          name: existing.name,
          symbol: existing.symbol,
          rate: existing.rate,
          isActive: existing.isActive,
        },
      });
    } else {
      // Create new currency
      const newRate = await CurrencyRate.create({
        code: code.toUpperCase(),
        name,
        symbol,
        rate,
        isActive: isActive !== undefined ? isActive : true,
      });

      return NextResponse.json({
        success: true,
        rate: {
          _id: newRate._id.toString(),
          code: newRate.code,
          name: newRate.name,
          symbol: newRate.symbol,
          rate: newRate.rate,
          isActive: newRate.isActive,
        },
      });
    }
  } catch (error: any) {
    console.error('Error saving currency rate:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Currency ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    await CurrencyRate.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting currency rate:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
