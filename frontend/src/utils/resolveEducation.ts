/** Match backend resolveEducation — profile form fields are source of truth for HR display */
export type EducationEntry = {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
};

type StudentLike = {
  college?: string;
  degree?: string;
  graduationYear?: number;
  education?: EducationEntry[];
};

export function resolveEducation(student?: StudentLike): EducationEntry[] {
  if (!student) return [];

  const college = student.college;
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
