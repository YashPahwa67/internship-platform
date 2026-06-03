import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  Link,
  Stack,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { resolveEducation } from '../../utils/resolveEducation';

export type CandidateProfile = {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  location?: string;
  bio?: string;
  skills?: string[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  profilePicture?: { url?: string };
  resume?: { url?: string; filename?: string };
  education?: {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
  }[];
  projects?: {
    title?: string;
    description?: string;
    url?: string;
    technologies?: string[];
  }[];
  experience?: {
    company?: string;
    role?: string;
    description?: string;
    current?: boolean;
  }[];
  certifications?: {
    name?: string;
    issuer?: string;
    credentialUrl?: string;
  }[];
};

type ResumeAsset = { url?: string; filename?: string };

type Props = {
  student?: CandidateProfile;
  coverLetter?: string;
  resumeAtApplication?: ResumeAsset;
};

function ResumeLink({ label, asset }: { label: string; asset?: ResumeAsset }) {
  if (!asset?.url) return null;
  return (
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      startIcon={<DescriptionOutlinedIcon />}
      endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
      href={asset.url}
      target="_blank"
      rel="noopener noreferrer"
      component="a"
      sx={{ mr: 1, mb: 1 }}
    >
      {label}
      {asset.filename ? ` (${asset.filename})` : ''}
    </Button>
  );
}

export default function CandidateProfileView({ student, coverLetter, resumeAtApplication }: Props) {
  if (!student) {
    return (
      <Typography variant="body2" color="text.secondary">
        No profile data available.
      </Typography>
    );
  }

  const education = resolveEducation(student);

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar
          src={student.profilePicture?.url}
          sx={{ width: 56, height: 56 }}
        >
          {student.name?.charAt(0) || '?'}
        </Avatar>
        <Box>
          <Typography fontWeight={600}>{student.name}</Typography>
          {student.email && (
            <Typography variant="body2" color="text.secondary">
              {student.email}
            </Typography>
          )}
          {student.phone && (
            <Typography variant="body2" color="text.secondary">
              {student.phone}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {student.college && <Chip size="small" label={student.college} variant="outlined" />}
        {student.degree && <Chip size="small" label={student.degree} variant="outlined" />}
        {student.graduationYear && (
          <Chip size="small" label={`Class of ${student.graduationYear}`} variant="outlined" />
        )}
        {student.location && <Chip size="small" label={student.location} variant="outlined" />}
      </Box>

      {(student.linkedIn || student.github || student.portfolio) && (
        <Box sx={{ mb: 2 }}>
          {student.linkedIn && (
            <Link href={student.linkedIn} target="_blank" rel="noopener" sx={{ display: 'block', fontSize: '0.875rem' }}>
              LinkedIn
            </Link>
          )}
          {student.github && (
            <Link href={student.github} target="_blank" rel="noopener" sx={{ display: 'block', fontSize: '0.875rem' }}>
              GitHub
            </Link>
          )}
          {student.portfolio && (
            <Link href={student.portfolio} target="_blank" rel="noopener" sx={{ display: 'block', fontSize: '0.875rem' }}>
              Portfolio
            </Link>
          )}
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Resume
        </Typography>
        <ResumeLink label="Current resume" asset={student.resume} />
        <ResumeLink label="Resume at application" asset={resumeAtApplication} />
        {!student.resume?.url && !resumeAtApplication?.url && (
          <Typography variant="body2" color="text.secondary">
            No resume uploaded.
          </Typography>
        )}
      </Box>

      {coverLetter && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Cover letter
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {coverLetter}
          </Typography>
        </Box>
      )}

      {student.bio && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            About
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {student.bio}
          </Typography>
        </Box>
      )}

      {student.skills && student.skills.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {student.skills.map((s) => (
              <Chip key={s} label={s} size="small" />
            ))}
          </Box>
        </Box>
      )}

      {education.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Education
          </Typography>
          {education.map((ed, i) => (
            <Box key={i} sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight={500}>
                {ed.institution}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' · ')}
                {(ed.startYear || ed.endYear) &&
                  ` · ${ed.startYear || ''}${ed.endYear ? `–${ed.endYear}` : ''}`}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {student.experience && student.experience.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Experience
          </Typography>
          {student.experience.map((ex, i) => (
            <Box key={i} sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight={500}>
                {ex.role} @ {ex.company}
                {ex.current ? ' (current)' : ''}
              </Typography>
              {ex.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {ex.description}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {student.projects && student.projects.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Projects
          </Typography>
          {student.projects.map((p, i) => (
            <Box key={i} sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight={500}>
                {p.title}
                {p.url && (
                  <Link href={p.url} target="_blank" rel="noopener" sx={{ ml: 1, fontSize: '0.75rem' }}>
                    View
                  </Link>
                )}
              </Typography>
              {p.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {p.description}
                </Typography>
              )}
              {p.technologies && p.technologies.length > 0 && (
                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {p.technologies.map((t) => (
                    <Chip key={t} label={t} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </>
      )}

      {student.certifications && student.certifications.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Certifications
          </Typography>
          {student.certifications.map((c, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {c.name}
                {c.issuer ? ` — ${c.issuer}` : ''}
              </Typography>
              {c.credentialUrl && (
                <Link href={c.credentialUrl} target="_blank" rel="noopener" variant="caption">
                  Credential link
                </Link>
              )}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}
