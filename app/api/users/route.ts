import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid') || searchParams.get('id');
    if (!uid) return NextResponse.json({ error: 'uid is required' }, { status: 400 });

    const { db } = await connectToDatabase();
    const doc = await db.collection('users').findOne({ _id: uid as any });
    if (!doc) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const { _id, ...rest } = doc as any;
    return NextResponse.json({ id: _id, ...rest });
  } catch (err: any) {
    console.error('users GET error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || url.searchParams.get('uid');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const payload = await request.json();
    const { db } = await connectToDatabase();
    await db.collection('users').updateOne({ _id: id as any }, { $set: payload }, { upsert: true });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('users PUT error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
