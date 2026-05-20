#!/usr/bin/env node
/**
 * scripts/migrate_blob_urls.js
 *
 * Usage:
 *  - Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON that has
 *    access to your Firestore, or set `FIREBASE_SERVICE_ACCOUNT` to a path.
 *  - Run: `node scripts/migrate_blob_urls.js`
 *
 * What it does:
 *  - Iterates the `vehicles` collection and normalizes `images` entries into
 *    same-origin proxied preview URLs (`/api/blob/preview?pathname=...`).
 *
 * NOTE: This script performs live updates. Run it only after backing up your
 * Firestore or testing locally.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function main() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!credPath) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT to the service account JSON path.');
    process.exit(1);
  }

  if (!fs.existsSync(credPath)) {
    console.error('Service account file not found at', credPath);
    process.exit(1);
  }

  const serviceAccount = require(path.resolve(credPath));

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const collectionName = 'vehicles';
  const batchSize = 200;
  let lastDoc = null;
  let processed = 0;
  let updated = 0;

  while (true) {
    let query = db.collection(collectionName).limit(batchSize);
    if (lastDoc) query = query.startAfter(lastDoc);
    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const docSnap of snapshot.docs) {
      processed++;
      const data = docSnap.data() || {};
      const images = Array.isArray(data.images) ? data.images : [];

      const newImages = images.map((img) => {
        if (!img || typeof img !== 'string') return img;

        // Already proxied
        if (img.startsWith('/api/blob/preview')) return img;

        try {
          // If it's a full URL pointing to Vercel Blob, extract pathname
          if (img.startsWith('http')) {
            const url = new URL(img);
            if (url.hostname.endsWith('.blob.vercel-storage.com')) {
              const pathname = url.pathname.replace(/^\//, '');
              return `/api/blob/preview?pathname=${encodeURIComponent(pathname)}`;
            }
            // Otherwise leave public URL as-is
            return img;
          }

          // If it's a raw pathname (no http), normalize and proxy
          const pathname = img.replace(/^\/+/, '');
          return `/api/blob/preview?pathname=${encodeURIComponent(pathname)}`;
        } catch (e) {
          return img;
        }
      });

      if (JSON.stringify(images) !== JSON.stringify(newImages)) {
        await db.collection(collectionName).doc(docSnap.id).update({ images: newImages });
        console.log(`Updated ${docSnap.id}`);
        updated++;
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  console.log(`Done. Processed ${processed} documents, updated ${updated}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
