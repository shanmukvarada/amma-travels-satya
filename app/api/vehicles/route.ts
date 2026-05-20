import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();

    const now = new Date();
    const doc = { ...body, createdAt: now, updatedAt: now };

    const result = await db.collection('vehicles').insertOne(doc as any);

    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    console.error('vehicles POST error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const payload = await request.json();
    const { db } = await connectToDatabase();

    const _id = new ObjectId(id);
    const res = await db.collection('vehicles').updateOne({ _id }, { $set: { ...payload, updatedAt: new Date() } });
    if (res.matchedCount === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('vehicles PUT error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { db } = await connectToDatabase();

    if (id) {
      const doc = await db.collection('vehicles').findOne({ _id: new ObjectId(id) });
      if (!doc) return NextResponse.json({ error: 'not found' }, { status: 404 });
      // convert _id to id string for client
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = doc as any;
      return NextResponse.json({ id: _id.toString(), ...rest });
    }

    const docs = await db.collection('vehicles').find({}).limit(200).toArray();
    const mapped = docs.map((d: any) => {
      const { _id, ...rest } = d;
      return { id: _id.toString(), ...rest };
    });
    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error('vehicles GET error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { db } = await connectToDatabase();
    const res = await db.collection('vehicles').deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('vehicles DELETE error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
