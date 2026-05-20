import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname') || searchParams.get('url');

  if (!pathname) {
    return NextResponse.json({ error: 'pathname is required' }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured' }, { status: 500 });
  }

  try {
    // Use the server-side `get` helper to fetch the blob using the token.
    const result = await get(pathname, { access: 'private', token });

    if (!result) {
      return NextResponse.json({ error: 'Blob not found' }, { status: 404 });
    }

    const { blob, stream } = result as any;

    if (!blob) {
      return NextResponse.json({ error: 'Blob metadata missing' }, { status: 500 });
    }

    const headers = new Headers();
    if (blob.contentType) headers.set('Content-Type', blob.contentType);
    if (blob.cacheControl) headers.set('Cache-Control', blob.cacheControl);
    if (blob.contentDisposition) headers.set('Content-Disposition', blob.contentDisposition || 'inline');
    if (blob.etag) headers.set('ETag', blob.etag);

    // Stream the blob back to the client so the browser can load it from our origin.
    return new NextResponse(stream ?? null, { headers });
  } catch (error: any) {
    console.error('Error proxying blob:', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
