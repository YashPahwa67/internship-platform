import mongoose from 'mongoose';
import { cloudinaryAssetSchema } from './schemas/cloudinaryAsset.schema.js';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '', maxlength: 5000 },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    logo: { type: cloudinaryAssetSchema, default: undefined },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text', description: 'text' });

export const Company = mongoose.model('Company', companySchema);
