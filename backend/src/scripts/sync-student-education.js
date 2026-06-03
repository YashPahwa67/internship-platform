/**
 * One-time fix: align education[] in MongoDB with college / degree / graduationYear.
 * Run: npm run sync-education
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import '../models/User.js';
import { Student } from '../models/Student.js';
import { resolveEducation } from '../utils/formatStudentProfile.js';

await mongoose.connect(config.mongoUri);

const students = await Student.find({}).lean();
let updated = 0;

for (const s of students) {
  const synced = resolveEducation(s);
  if (!synced.length) continue;

  const current = JSON.stringify(s.education || []);
  const next = JSON.stringify(synced);
  if (current === next) continue;

  await Student.updateOne({ _id: s._id }, { $set: { education: synced } });
  updated += 1;
  console.log(`Synced education for ${s.fullName || s._id}`);
}

console.log(`Done. Updated ${updated} of ${students.length} student profile(s).`);
await mongoose.disconnect();
