/**
 * One-time: publish internships stuck in pending_review (e.g. before auto-publish fix).
 * Usage: node src/scripts/publish-pending-internships.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Internship } from '../models/Internship.js';
import { connectRedis } from '../config/redis.js';
import { invalidateInternshipListCache } from '../middleware/cache.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    await connectRedis();
  } catch {
    /* optional */
  }
  const result = await Internship.updateMany(
    { status: 'pending_review' },
    { $set: { status: 'published', publishedAt: new Date() } }
  );
  await invalidateInternshipListCache();
  console.log(`Published ${result.modifiedCount} internship(s) previously pending review.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
