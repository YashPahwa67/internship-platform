import mongoose from 'mongoose';
import {
  cloudinaryAssetSchema,
  educationSchema,
  projectSchema,
  experienceSchema,
  certificationSchema,
} from './schemas/cloudinaryAsset.schema.js';
import { resolveEducation } from '../utils/formatStudentProfile.js';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20 },
    college: { type: String, trim: true, maxlength: 200 },
    degree: { type: String, trim: true, maxlength: 120 },
    skills: {
      type: [{ type: String, trim: true, maxlength: 50 }],
      validate: [(v) => v.length <= 30, 'Maximum 30 skills allowed'],
    },
    bio: { type: String, default: '', maxlength: 2000 },
    linkedIn: { type: String, trim: true, maxlength: 500 },
    github: { type: String, trim: true, maxlength: 500 },
    portfolio: { type: String, trim: true, maxlength: 500 },
    location: { type: String, trim: true, maxlength: 120 },
    profilePicture: { type: cloudinaryAssetSchema, default: undefined },
    resume: { type: cloudinaryAssetSchema, default: undefined },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    /** @deprecated use college — kept for backward compatibility */
    university: { type: String, trim: true },
    graduationYear: { type: Number, min: 1990, max: 2040 },
    portfolioLinks: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.index({ skills: 1 });
studentSchema.index({ college: 1 });

studentSchema.virtual('email', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.pre('save', function syncLegacyFields(next) {
  if (this.college && !this.university) this.university = this.college;
  if (this.university && !this.college) this.college = this.university;

  const synced = resolveEducation(this);
  if (synced.length) this.education = synced;

  next();
});

studentSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId }).populate('userId', 'email firstName lastName');
};

export const Student = mongoose.model('Student', studentSchema);
