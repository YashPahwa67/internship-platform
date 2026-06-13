import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { Internship } from '../models/Internship.js';
import { Student } from '../models/Student.js';
import { AuditLog } from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../utils/auditLog.js';

function formatUser(u) {
  return {
    id: u._id,
    email: u.email,
    role: u.role,
    status: u.status,
    firstName: u.firstName,
    lastName: u.lastName,
    createdAt: u.createdAt,
    deletedAt: u.deletedAt ?? null,
  };
}

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    filter.status = { $ne: 'deleted' };
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: users.map(formatUser), meta: { page, limit, total } });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  await logAudit(req, `user.${req.body.status}`, 'user', user._id, { targetEmail: user.email });
  res.json({ success: true, data: { id: user._id, status: user.status } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  if (user.status === 'deleted') throw new ApiError(400, 'ALREADY_DELETED', 'User is already deleted');

  user.status = 'deleted';
  user.deletedAt = new Date();
  user.refreshTokenFamily = null;
  await user.save();

  await logAudit(req, 'user.delete', 'user', user._id, { targetEmail: user.email, role: user.role });
  res.json({ success: true, data: formatUser(user.toObject()) });
});

export const purgeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  if (user.status !== 'deleted') throw new ApiError(400, 'NOT_DELETED', 'Only soft-deleted users can be permanently deleted');

  const { Student } = await import('../models/Student.js');
  await Student.deleteOne({ userId: user._id });
  await user.deleteOne();

  await logAudit(req, 'user.purge', 'user', req.params.id, { targetEmail: user.email, role: user.role });
  res.json({ success: true, data: { message: 'User permanently deleted' } });
});

export const restoreUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  if (user.status !== 'deleted') throw new ApiError(400, 'NOT_DELETED', 'User is not deleted');

  user.status = 'active';
  user.deletedAt = undefined;
  await user.save();

  await logAudit(req, 'user.restore', 'user', user._id, { targetEmail: user.email });
  res.json({ success: true, data: formatUser(user.toObject()) });
});

export const approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'NOT_FOUND', 'Company not found');
  company.approvalStatus = req.body.approved ? 'approved' : 'rejected';
  company.approvedAt = req.body.approved ? new Date() : undefined;
  await company.save();

  await logAudit(req, `company.${req.body.approved ? 'approve' : 'reject'}`, 'company', company._id, { companyName: company.name });
  res.json({ success: true, data: { id: company._id, approvalStatus: company.approvalStatus } });
});

export const pendingCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: companies.map((c) => ({ id: c._id, name: c.name, industry: c.industry, approvalStatus: c.approvalStatus })),
  });
});

export const analytics = asyncHandler(async (req, res) => {
  const [users, students, companies, internships, applications, published] = await Promise.all([
    User.countDocuments(),
    Student.countDocuments(),
    Company.countDocuments({ approvalStatus: 'approved' }),
    Internship.countDocuments(),
    Application.countDocuments(),
    Internship.countDocuments({ status: 'published' }),
  ]);

  const [appsByStatus, topCompanies] = await Promise.all([
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),
    Internship.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$companyId', total: { $sum: 1 }, totalOpenings: { $sum: '$openings' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
      { $unwind: '$company' },
      { $project: { companyId: '$_id', name: '$company.name', total: 1, totalOpenings: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      users, students, companies, internships, publishedInternships: published, applications,
      applicationsByStatus: Object.fromEntries(appsByStatus.map((s) => [s.status, s.count])),
      topCompanies,
    },
  });
});

export const bulkUserAction = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) throw new ApiError(400, 'VALIDATION_ERROR', 'ids must be a non-empty array');
  if (!['suspend', 'activate', 'delete'].includes(action)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid action');

  const results = { success: [], failed: [] };

  await Promise.all(ids.map(async (id) => {
    try {
      const user = await User.findById(id);
      if (!user) { results.failed.push({ id, reason: 'Not found' }); return; }

      if (action === 'delete') {
        if (user.status === 'deleted') { results.failed.push({ id, reason: 'Already deleted' }); return; }
        user.status = 'deleted';
        user.deletedAt = new Date();
        user.refreshTokenFamily = null;
        await user.save();
        await logAudit(req, 'user.delete', 'user', user._id, { targetEmail: user.email });
      } else {
        const newStatus = action === 'suspend' ? 'suspended' : 'active';
        user.status = newStatus;
        await user.save();
        await logAudit(req, `user.${newStatus}`, 'user', user._id, { targetEmail: user.email });
      }
      results.success.push(id);
    } catch {
      results.failed.push({ id, reason: 'Update failed' });
    }
  }));

  res.json({ success: true, data: results });
});

function escapeCsv(val) {
  if (val == null) return '';
  const s = String(val);
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows, columns) {
  const header = columns.map((c) => c.label).join(',');
  const body = rows.map((r) => columns.map((c) => escapeCsv(r[c.key])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export const exportUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean();

  const csv = toCsv(users, [
    { label: 'ID', key: '_id' },
    { label: 'Email', key: 'email' },
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    { label: 'Role', key: 'role' },
    { label: 'Status', key: 'status' },
    { label: 'Email Verified', key: 'emailVerified' },
    { label: 'Joined', key: 'createdAt' },
    { label: 'Deleted At', key: 'deletedAt' },
  ]);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.csv"`);
  res.send(csv);
});

export const exportApplications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const apps = await Application.find(filter)
    .populate('internshipId', 'title')
    .populate('studentId', 'fullName')
    .populate('userId', 'email')
    .sort({ createdAt: -1 })
    .lean();

  const rows = apps.map((a) => ({
    id: a._id,
    studentEmail: a.userId?.email,
    studentName: a.studentId?.fullName,
    internship: a.internshipId?.title,
    status: a.status,
    appliedAt: a.appliedAt,
    studentRating: a.studentReview?.rating ?? '',
    companyRating: a.companyReview?.rating ?? '',
  }));

  const csv = toCsv(rows, [
    { label: 'ID', key: 'id' },
    { label: 'Student Email', key: 'studentEmail' },
    { label: 'Student Name', key: 'studentName' },
    { label: 'Internship', key: 'internship' },
    { label: 'Status', key: 'status' },
    { label: 'Applied At', key: 'appliedAt' },
    { label: 'Student Rating', key: 'studentRating' },
    { label: 'Company Rating', key: 'companyRating' },
  ]);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="applications-${Date.now()}.csv"`);
  res.send(csv);
});

export const getAuditLog = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.action) filter.action = new RegExp(req.query.action, 'i');
  if (req.query.actorId) filter.actorId = req.query.actorId;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: logs.map((l) => ({
      id: l._id,
      actorEmail: l.actorEmail,
      action: l.action,
      targetType: l.targetType,
      targetEmail: l.targetEmail,
      metadata: l.metadata,
      createdAt: l.createdAt,
    })),
    meta: { page, limit, total },
  });
});
