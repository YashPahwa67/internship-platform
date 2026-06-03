import mongoose from 'mongoose';
import { INTERNSHIP_STATUS } from '../constants/roles.js';

const internshipSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    type: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'remote' },
    location: { type: String, default: 'Remote' },
    stipend: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    durationWeeks: { type: Number, default: 12 },
    openings: { type: Number, default: 1 },
    applicationDeadline: { type: Date },
    status: { type: String, enum: INTERNSHIP_STATUS, default: 'draft' },
    publishedAt: { type: Date },
    applicationCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

internshipSchema.index({ companyId: 1, slug: 1 }, { unique: true });
internshipSchema.index({ status: 1, publishedAt: -1 });
internshipSchema.index({ title: 'text', description: 'text' });

export const Internship = mongoose.model('Internship', internshipSchema);
