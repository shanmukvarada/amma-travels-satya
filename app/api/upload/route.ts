import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured in the environment');
    }

    // Read the request body as an ArrayBuffer to avoid streaming compatibility issues
    const buffer = await request.arrayBuffer();

    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type');
    
    const blob = await put(filename, buffer, {
      access: 'private',
      token: token,
      ...(contentType ? { contentType } : {}),
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}
