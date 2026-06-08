/** Shared shape for student profile exposed to HR / admins */

/** Source of truth: college, degree, graduationYear from profile form → education block for HR */
export function resolveEducation(student) {
  if (!student || typeof student !== 'object') return [];

  const college = student.college || student.university;
  const degree = student.degree;
  const graduationYear = student.graduationYear;

  if (college || degree || graduationYear) {
    const endYear = graduationYear;
    const startYear = endYear ? Math.max(endYear - 4, 1990) : undefined;
    return [
      {
        institution: college || degree || 'College',
        degree: degree || '',
        fieldOfStudy: degree || undefined,
        startYear,
        endYear,
      },
    ];
  }

  return student.education || [];
}

export function formatStudentProfile(student) {
  if (!student || typeof student !== 'object') return undefined;

  const user = student.userId && typeof student.userId === 'object' ? student.userId : null;
  const name =
    student.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    undefined;

  const college = student.college || student.university;
  const education = resolveEducation(student);

  return {
    id: student._id?.toString(),
    userId: user?._id?.toString() || student.userId?.toString(),
    name,
    email: user?.email,
    phone: student.phone,
    college,
    degree: student.degree,
    graduationYear: student.graduationYear,
    location: student.location,
    bio: student.bio,
    rollNo: student.rollNo,
    cgpa: student.cgpa,
    skills: student.skills || [],
    linkedIn: student.linkedIn,
    github: student.github,
    portfolio: student.portfolio,
    profilePicture: student.profilePicture || undefined,
    resume: student.resume || undefined,
    education,
    projects: student.projects || [],
    experience: student.experience || [],
    certifications: student.certifications || [],
  };
}

export function formatResumeAsset(asset) {
  if (!asset?.url) return undefined;
  return {
    url: asset.url,
    filename: asset.filename,
    mimeType: asset.mimeType,
    uploadedAt: asset.uploadedAt,
  };
}

/** Build education array to persist — always derived from college / degree / graduation year */
export function buildPrimaryEducationPayload({ college, degree, graduationYear, existing }) {
  const resolvedCollege = college ?? existing?.college ?? existing?.university;
  const resolvedDegree = degree ?? existing?.degree;
  const resolvedYear = graduationYear ?? existing?.graduationYear;

  if (!resolvedCollege && !resolvedDegree && !resolvedYear) return null;

  return resolveEducation({
    college: resolvedCollege,
    university: resolvedCollege,
    degree: resolvedDegree,
    graduationYear: resolvedYear,
    education: [],
  });
}
