/**
 * Creates or resets the demo admin without wiping other data.
 * Usage: node src/scripts/ensure-admin.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ROLES } from '../constants/roles.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@imp.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await User.hashPassword(ADMIN_PASSWORD);

  const user = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        email: ADMIN_EMAIL,
        passwordHash,
        role: ROLES.ADMIN,
        firstName: 'Platform',
        lastName: 'Admin',
        status: 'active',
        emailVerified: true,
        failedLoginAttempts: 0,
      },
      $unset: { lockUntil: 1 },
    },
    { upsert: true, new: true }
  );

  console.log(`Admin ready: ${user.email} / ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
