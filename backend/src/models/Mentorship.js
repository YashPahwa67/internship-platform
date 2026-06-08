import mongoose from 'mongoose';

const mentorshipSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    status: {
      type: String,
      enum: ['pending', 'active', 'declined', 'ended'],
      default: 'pending',
    },
    sessionNotes: [
      {
        content: { type: String, maxlength: 2000 },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    progressLog: [
      {
        entry: { type: String, maxlength: 2000 },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

mentorshipSchema.index({ mentorId: 1, status: 1 });
mentorshipSchema.index({ studentId: 1 });

export const Mentorship = mongoose.model('Mentorship', mentorshipSchema);
