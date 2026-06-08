import { Mentorship } from '../models/Mentorship.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const listMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({ role: ROLES.MENTOR, status: 'active' })
    .select('firstName lastName email')
    .lean();
  res.json({ success: true, data: mentors.map((m) => ({ id: m._id, name: `${m.firstName} ${m.lastName}`.trim(), email: m.email })) });
});

export const requestMentorship = asyncHandler(async (req, res) => {
  const { mentorId, applicationId } = req.body;
  const mentor = await User.findOne({ _id: mentorId, role: ROLES.MENTOR, status: 'active' });
  if (!mentor) throw new ApiError(404, 'NOT_FOUND', 'Mentor not found');

  const existing = await Mentorship.findOne({ mentorId, studentId: req.user._id, status: { $in: ['pending', 'active'] } });
  if (existing) throw new ApiError(409, 'ALREADY_REQUESTED', 'You already have a pending or active mentorship with this mentor');

  const mentorship = await Mentorship.create({ mentorId, studentId: req.user._id, applicationId });
  res.status(201).json({ success: true, data: formatMentorship(mentorship) });
});

export const listMyMentorships = asyncHandler(async (req, res) => {
  const filter = req.user.role === ROLES.MENTOR
    ? { mentorId: req.user._id }
    : { studentId: req.user._id };

  const mentorships = await Mentorship.find(filter)
    .populate('mentorId', 'firstName lastName email')
    .populate('studentId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: mentorships.map(formatMentorship) });
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const mentorship = await Mentorship.findOne({ _id: req.params.id, mentorId: req.user._id, status: 'pending' });
  if (!mentorship) throw new ApiError(404, 'NOT_FOUND', 'Pending mentorship request not found');

  mentorship.status = req.body.accept ? 'active' : 'declined';
  await mentorship.save();
  res.json({ success: true, data: formatMentorship(mentorship) });
});

export const addSessionNote = asyncHandler(async (req, res) => {
  const mentorship = await Mentorship.findOne({
    _id: req.params.id,
    status: 'active',
    $or: [{ mentorId: req.user._id }, { studentId: req.user._id }],
  });
  if (!mentorship) throw new ApiError(404, 'NOT_FOUND', 'Active mentorship not found');

  mentorship.sessionNotes.push({ content: req.body.content, addedBy: req.user._id });
  await mentorship.save();
  res.json({ success: true, data: { sessionNotes: mentorship.sessionNotes } });
});

export const addProgressEntry = asyncHandler(async (req, res) => {
  const mentorship = await Mentorship.findOne({
    _id: req.params.id,
    status: 'active',
    $or: [{ mentorId: req.user._id }, { studentId: req.user._id }],
  });
  if (!mentorship) throw new ApiError(404, 'NOT_FOUND', 'Active mentorship not found');

  mentorship.progressLog.push({ entry: req.body.entry, addedBy: req.user._id });
  await mentorship.save();
  res.json({ success: true, data: { progressLog: mentorship.progressLog } });
});

function formatMentorship(m) {
  const mentor = m.mentorId;
  const student = m.studentId;
  return {
    id: m._id,
    status: m.status,
    mentor: mentor && typeof mentor === 'object'
      ? { id: mentor._id, name: `${mentor.firstName} ${mentor.lastName}`.trim(), email: mentor.email }
      : { id: mentor },
    student: student && typeof student === 'object'
      ? { id: student._id, name: `${student.firstName} ${student.lastName}`.trim(), email: student.email }
      : { id: student },
    applicationId: m.applicationId,
    sessionNotes: m.sessionNotes,
    progressLog: m.progressLog,
    createdAt: m.createdAt,
  };
}
