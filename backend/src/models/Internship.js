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
    requireResume: { type: Boolean, default: false },
    applicationForm: [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ['text', 'textarea', 'select', 'radio', 'url', 'number'], default: 'text' },
        question: { type: String, required: true, maxlength: 500 },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

internshipSchema.index({ companyId: 1, slug: 1 }, { unique: true });
internshipSchema.index({ status: 1, _id: -1 });
internshipSchema.index({ status: 1, publishedAt: -1 });
internshipSchema.index({ companyId: 1, status: 1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ title: 'text', description: 'text' });

export const Internship = mongoose.model('Internship', internshipSchema);
