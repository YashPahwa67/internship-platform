import { Internship } from '../models/Internship.js';
import { Company } from '../models/Company.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q, skills, type } = req.query;
  const filter = { status: 'published' };
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  if (skills) filter.skills = { $in: skills.split(',') };
  if (type) filter.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    Internship.find(filter)
      .populate('companyId', 'name slug')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Internship.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items.map(formatInternship),
    meta: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

export const getById = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate('companyId', 'name description website');
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  const isOwner = req.user?.companyId?.toString() === internship.companyId?._id?.toString();
  const isAdmin = req.user?.role === ROLES.ADMIN;
  if (internship.status !== 'published' && !isOwner && !isAdmin) {
    throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  }
  res.json({ success: true, data: formatInternship(internship) });
});

export const create = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.companyId);
  if (!company) throw new ApiError(400, 'VALIDATION_ERROR', 'Company not found');
  if (company.approvalStatus !== 'approved') {
    throw new ApiError(403, 'FORBIDDEN', 'Company must be approved before posting');
  }

  const slug = slugify(req.body.title) + '-' + Date.now().toString(36).slice(-4);
  const internship = await Internship.create({
    ...req.body,
    companyId: req.user.companyId,
    slug,
    createdBy: req.user._id,
    status: req.body.submit ? 'pending_review' : 'draft',
  });

  res.status(201).json({ success: true, data: formatInternship(internship) });
});

export const update = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({ _id: req.params.id, companyId: req.user.companyId });
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  Object.assign(internship, req.body);
  if (req.body.submit) internship.status = 'pending_review';
  await internship.save();
  res.json({ success: true, data: formatInternship(internship) });
});

export const companyList = asyncHandler(async (req, res) => {
  const items = await Internship.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: items.map(formatInternship) });
});

export const approve = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  if (req.body.approved) {
    internship.status = 'published';
    internship.publishedAt = new Date();
  } else {
    internship.status = 'rejected';
  }
  await internship.save();
  res.json({ success: true, data: formatInternship(internship) });
});

export const pendingReview = asyncHandler(async (req, res) => {
  const items = await Internship.find({ status: 'pending_review' })
    .populate('companyId', 'name')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: items.map(formatInternship) });
});

function formatInternship(i) {
  const company = i.companyId;
  return {
    id: i._id,
    title: i.title,
    slug: i.slug,
    description: i.description,
    requirements: i.requirements,
    skills: i.skills,
    type: i.type,
    location: i.location,
    stipend: i.stipend,
    durationWeeks: i.durationWeeks,
    openings: i.openings,
    applicationDeadline: i.applicationDeadline,
    status: i.status,
    publishedAt: i.publishedAt,
    applicationCount: i.applicationCount,
    company: company
      ? { id: company._id || company.id, name: company.name, slug: company.slug }
      : undefined,
    companyId: i.companyId?._id || i.companyId,
    createdAt: i.createdAt,
  };
}
