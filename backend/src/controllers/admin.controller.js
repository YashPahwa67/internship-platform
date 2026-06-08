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
