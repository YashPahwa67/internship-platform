import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../constants/roles.js';

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: APPLICATION_STATUS, default: 'applied' },
    coverLetter: { type: String, maxlength: 2000 },
    resumeSnapshot: {
      url: String,
      filename: String,
      uploadedAt: Date,
    },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formResponses: [
      {
        questionId: { type: String },
        question: { type: String },
        answer: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    studentReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 1000 },
      submittedAt: Date,
    },
    companyReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 1000 },
      submittedAt: Date,
    },
    statusHistory: [
      {
        status: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });
applicationSchema.index({ companyId: 1, status: 1 });

export const Application = mongoose.model('Application', applicationSchema);
