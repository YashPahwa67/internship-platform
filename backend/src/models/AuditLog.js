import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorEmail: { type: String },
    action: { type: String, required: true }, // e.g. 'user.delete', 'user.suspend', 'company.approve'
    targetType: { type: String }, // 'user', 'company', 'internship'
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetEmail: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
