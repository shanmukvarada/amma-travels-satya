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
    const shouldMultipart = buffer.byteLength > 5 * 1024 * 1024;

    const blob = await put(filename, buffer, {
      access: 'private',
      token,
      multipart: shouldMultipart,
      ...(contentType ? { contentType } : {}),
    });

    // Provide an absolute preview URL so it works when pasted into WhatsApp or opened off-origin.
    const previewUrl = blob?.pathname
      ? new URL(`/api/blob/preview?pathname=${encodeURIComponent(blob.pathname)}`, request.url).toString()
      : undefined;

    return NextResponse.json({ ...blob, previewUrl });
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}
