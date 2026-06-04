/**
 * Dev utility: delete a user account + their student profile by email.
 * Usage: node src/scripts/reset-account.js someone@gmail.com
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';

const email = process.argv[2];
if (!email) { console.error('Usage: node src/scripts/reset-account.js <email>'); process.exit(1); }

await mongoose.connect(process.env.MONGODB_URI);
const user = await User.findOne({ email });
if (!user) { console.log(`No account found for ${email}`); process.exit(0); }

await Student.deleteOne({ userId: user._id });
await User.deleteOne({ _id: user._id });
console.log(`✓ Deleted account + student profile for ${email}`);
await mongoose.disconnect();
