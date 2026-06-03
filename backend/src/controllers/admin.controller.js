import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { Internship } from '../models/Internship.js';
import { Student } from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;

  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).limit(100).lean();
  res.json({
    success: true,
    data: users.map((u) => ({
      id: u._id,
      email: u.email,
      role: u.role,
      status: u.status,
      firstName: u.firstName,
      lastName: u.lastName,
      createdAt: u.createdAt,
    })),
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  res.json({ success: true, data: { id: user._id, status: user.status } });
});

export const approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'NOT_FOUND', 'Company not found');
  company.approvalStatus = req.body.approved ? 'approved' : 'rejected';
  company.approvedAt = req.body.approved ? new Date() : undefined;
  await company.save();
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

  const appsByStatus = await Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  res.json({
    success: true,
    data: {
      users,
      students,
      companies,
      internships,
      publishedInternships: published,
      applications,
      applicationsByStatus: Object.fromEntries(appsByStatus.map((s) => [s._id, s.count])),
    },
  });
});
