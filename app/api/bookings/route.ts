import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { db } = await connectToDatabase();
    
    // Add timestamp and status
    const newBooking = {
      ...payload,
      createdAt: new Date(),
      status: 'Pending',
    };

    const result = await db.collection('bookings').insertOne(newBooking);

    return NextResponse.json({ ok: true, bookingId: result.insertedId });
  } catch (err: any) {
    console.error('bookings POST error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
