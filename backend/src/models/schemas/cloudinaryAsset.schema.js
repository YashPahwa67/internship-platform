import mongoose from 'mongoose';

/** Metadata only — binary files live in Cloudinary */
export const cloudinaryAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    grade: { type: String, trim: true },
    description: { type: String, maxlength: 500 },
  },
  { _id: true }
);

export const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 1000 },
    url: { type: String, trim: true },
    technologies: [{ type: String, trim: true }],
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: true }
);

export const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 1000 },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
  },
  { _id: true }
);

export const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialUrl: { type: String, trim: true },
  },
  { _id: true }
);
