import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME || 'amma_travels';

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

let cached: { client: MongoClient; db: Db } | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached) return cached;

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cached = { client, db };
  return cached;
}
