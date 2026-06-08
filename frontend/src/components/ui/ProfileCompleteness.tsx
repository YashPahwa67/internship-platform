import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

type Profile = {
  fullName?: string | null;
  phone?: string | null;
  college?: string | null;
  degree?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  profilePicture?: { url?: string | null } | null;
  resume?: { url?: string | null } | null;
  location?: string | null;
  linkedIn?: string | null;
};

const CHECKS = [
  { key: 'fullName', label: 'Full name', fn: (p: Profile) => Boolean(p.fullName?.trim()) },
  { key: 'phone', label: 'Phone number', fn: (p: Profile) => Boolean(p.phone?.trim()) },
  { key: 'college', label: 'College', fn: (p: Profile) => Boolean(p.college?.trim()) },
  { key: 'degree', label: 'Degree', fn: (p: Profile) => Boolean(p.degree?.trim()) },
  { key: 'bio', label: 'Bio (20+ chars)', fn: (p: Profile) => (p.bio?.trim().length || 0) >= 20 },
  { key: 'skills', label: 'At least 3 skills', fn: (p: Profile) => (p.skills?.length || 0) >= 3 },
  { key: 'picture', label: 'Profile photo', fn: (p: Profile) => Boolean(p.profilePicture?.url) },
  { key: 'resume', label: 'Resume uploaded', fn: (p: Profile) => Boolean(p.resume?.url) },
  { key: 'location', label: 'Location', fn: (p: Profile) => Boolean(p.location?.trim()) },
  { key: 'linkedIn', label: 'LinkedIn URL', fn: (p: Profile) => Boolean(p.linkedIn?.trim()) },
];

export default function ProfileCompleteness({ profile }: { profile: Profile }) {
  const passed = CHECKS.filter((c) => c.fn(profile));
  const pct = Math.round((passed.length / CHECKS.length) * 100);

  const color = pct < 40 ? 'error' : pct < 75 ? 'warning' : 'success';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>Profile completeness</Typography>
        <Chip label={`${pct}%`} size="small" color={color} />
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 8, borderRadius: 4, mb: 2 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {CHECKS.map((c) => {
          const done = c.fn(profile);
          return (
            <Chip
              key={c.key}
              label={c.label}
              size="small"
              icon={done ? <CheckCircleOutlineIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
              variant={done ? 'filled' : 'outlined'}
              color={done ? 'success' : 'default'}
              sx={{ fontSize: '0.72rem', opacity: done ? 1 : 0.6 }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
