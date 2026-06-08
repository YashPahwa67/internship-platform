import mongoose from 'mongoose';
import { Internship } from '../models/Internship.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import {
  invalidateInternshipCache,
  invalidateInternshipListCache,
} from '../middleware/cache.js';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const list = asyncHandler(async (req, res) => {
  const { cursor, limit = 20, q, skills, type, location, stipendMin, stipendMax, durationMin, durationMax } = req.query;
  const filter = { status: 'published' };

  if (location) filter.location = new RegExp(location, 'i');
  if (type) {
    const types = type.split(',').map((t) => t.trim()).filter(Boolean);
    if (types.length === 1) filter.type = types[0];
    else if (types.length > 1) filter.type = { $in: types };
  }
  if (stipendMin || stipendMax) {
    filter['stipend.min'] = {};
    if (stipendMin) filter['stipend.min'].$gte = parseInt(stipendMin, 10);
    if (stipendMax) filter['stipend.min'].$lte = parseInt(stipendMax, 10);
  }
  if (durationMin || durationMax) {
    filter.durationWeeks = {};
    if (durationMin) filter.durationWeeks.$gte = parseInt(durationMin, 10);
    if (durationMax) filter.durationWeeks.$lte = parseInt(durationMax, 10);
  }
  if (skills) filter.skills = { $in: skills.split(',').map((s) => s.trim()) };
  if (q) {
    const term = q.trim();
    if (term) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      // Resolve company name matches so we can filter by companyId
      const matchingCompanies = await Company.find({ name: rx }).select('_id').lean();
      const matchingCompanyIds = matchingCompanies.map((c) => c._id);
      filter.$or = [
        { title: rx },
        { description: rx },
        { skills: rx },
        { location: rx },
        ...(matchingCompanyIds.length ? [{ companyId: { $in: matchingCompanyIds } }] : []),
      ];
    }
  }
  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid cursor');
    }
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const lim = Math.min(parseInt(limit, 10) || 20, 50);
  const items = await Internship.find(filter)
    .populate('companyId', 'name slug')
    .sort({ _id: -1 })
    .limit(lim + 1)
    .lean();

  const hasNext = items.length > lim;
  if (hasNext) items.pop();

  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    data: items.map(formatInternship),
    meta: {
      nextCursor: hasNext ? items.at(-1)?._id?.toString() : null,
      hasNext,
      limit: lim,
    },
  });
});

export const getById = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id)
    .populate('companyId', 'name description website')
    .lean();
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');

  const isOwner = req.user?.companyId?.toString() === internship.companyId?._id?.toString();
  const isAdmin = req.user?.role === ROLES.ADMIN;
  if (internship.status !== 'published' && !isOwner && !isAdmin) {
    throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  }
  res.json({ success: true, data: formatInternship(internship) });
});

export const create = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.companyId).lean();
  if (!company) throw new ApiError(400, 'VALIDATION_ERROR', 'Company not found');
  if (company.approvalStatus !== 'approved') {
    throw new ApiError(403, 'FORBIDDEN', 'Company must be approved before posting');
  }

  const { submit, ...fields } = req.body;
  const slug = slugify(fields.title) + '-' + Date.now().toString(36).slice(-4);
  const publishNow = Boolean(submit);
  const internship = await Internship.create({
    ...fields,
    companyId: req.user.companyId,
    slug,
    createdBy: req.user._id,
    status: publishNow ? 'published' : 'draft',
    publishedAt: publishNow ? new Date() : undefined,
  });

  await invalidateInternshipListCache();
  res.status(201).json({ success: true, data: formatInternship(internship) });
});

export const update = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({ _id: req.params.id, companyId: req.user.companyId });
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  const { submit, ...updates } = req.body;
  Object.assign(internship, updates);
  if (submit) {
    internship.status = 'published';
    internship.publishedAt = new Date();
  }
  await internship.save();
  await invalidateInternshipListCache();
  await invalidateInternshipCache(internship._id.toString());
  res.json({ success: true, data: formatInternship(internship) });
});

export const companyList = asyncHandler(async (req, res) => {
  const items = await Internship.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: items.map(formatInternship) });
});

export const companyGetOne = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  })
    .populate('companyId', 'name slug')
    .lean();
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');
  res.json({ success: true, data: formatInternship(internship) });
});

export const remove = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({
    _id: req.params.id,
    companyId: req.user.companyId,
  });
  if (!internship) throw new ApiError(404, 'NOT_FOUND', 'Internship not found');

  const applicationCount = await Application.countDocuments({ internshipId: internship._id });
  if (applicationCount > 0) {
    internship.status = 'closed';
    await internship.save();
    await invalidateInternshipListCache();
    await invalidateInternshipCache(internship._id.toString());
    return res.json({
      success: true,
      data: { message: 'Listing closed (applications exist)', status: 'closed' },
    });
  }

  await internship.deleteOne();
  await invalidateInternshipListCache();
  await invalidateInternshipCache(internship._id.toString());
  res.json({ success: true, data: { message: 'Internship deleted' } });
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
  await invalidateInternshipCache(internship._id.toString());
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
