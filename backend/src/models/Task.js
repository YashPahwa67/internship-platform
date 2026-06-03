import mongoose from 'mongoose';
import { TASK_STATUS } from '../constants/roles.js';

const taskSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    deadline: { type: Date },
    status: { type: String, enum: TASK_STATUS, default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    submission: {
      notes: String,
      submittedAt: Date,
    },
    review: {
      feedback: String,
      rating: { type: Number, min: 1, max: 5 },
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

taskSchema.index({ applicationId: 1, deadline: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

export const Task = mongoose.model('Task', taskSchema);
