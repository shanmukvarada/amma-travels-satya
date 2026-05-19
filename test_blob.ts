import { put } from '@vercel/blob';

async function main() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log("Token:", token ? token.substring(0, 10) + "..." : "missing");
    
    // Default is usually 'public'
    const blob1 = await put('test1.txt', 'hello', {
      access: 'public',
      token
    });
    console.log("Blob 1:", blob1);
  } catch (err: any) {
    console.error("Public Error:", err.message);
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob2 = await put('test2.txt', 'hello', {
      access: 'public', // maybe private? Let's try it
    } as any);
    console.log("Blob 2:", blob2);
  } catch (err: any) {
    console.error("No access specified:", err.message);
  }
}

main();
