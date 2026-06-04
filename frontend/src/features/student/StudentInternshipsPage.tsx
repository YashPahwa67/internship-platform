import { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography, CardContent, Grid, Chip, Box, Button,
  TextField, InputAdornment, Stack, alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useGetInternshipsQuery } from '../../api/internshipApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const TYPE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Remote', value: 'remote', icon: <WifiOutlinedIcon sx={{ fontSize: 14 }} /> },
  { label: 'Hybrid', value: 'hybrid', icon: <HomeOutlinedIcon sx={{ fontSize: 14 }} /> },
  { label: 'Onsite', value: 'onsite', icon: <WorkOutlinedIcon sx={{ fontSize: 14 }} /> },
];

type Internship = {
  id: string; title: string; description?: string;
  company?: { name: string };
  type: string; location: string; skills: string[];
  stipend?: { min: number; max: number }; durationWeeks: number;
};

function matchesQuery(job: Internship, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    job.title?.toLowerCase().includes(lower) ||
    job.company?.name?.toLowerCase().includes(lower) ||
    job.location?.toLowerCase().includes(lower) ||
    job.skills?.some((s) => s.toLowerCase().includes(lower)) ||
    job.description?.toLowerCase().includes(lower) ||
    false
  );
}

export default function StudentInternshipsPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const { mode } = useThemeMode();
  const t = tokens[mode];

  // Load all at once — client-side filter for instant, multi-field search
  const { data, isLoading, isFetching, refetch } = useGetInternshipsQuery(
    { limit: 100 },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  );
  const all = (data?.data || []) as Internship[];

  const internships = useMemo(() => {
    return all.filter((job) => {
      const typeOk = !type || job.type === type;
      const qOk = !q || matchesQuery(job, q);
      return typeOk && qOk;
    });
  }, [all, q, type]);

  const hasFilters = q || type;

  return (
    <Box>
      <PageHeader
        title="Internships"
        subtitle="Search by role, skill, company, or location."
        action={
          <Button size="small" variant="outlined" color="inherit" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {/* Search + filters */}
      <FadeIn>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Role, skill, company or location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ mb: 2, maxWidth: 520 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
            {TYPE_FILTERS.map((f) => {
              const active = type === f.value;
              return (
                <Chip
                  key={f.value}
                  label={f.label}
                  icon={f.icon}
                  onClick={() => setType(f.value)}
                  variant={active ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: active ? 600 : 500, fontSize: '0.8125rem',
                    height: 34, px: 0.5,
                    bgcolor: active ? t.accentMuted : 'transparent',
                    color: active ? t.accent : 'text.secondary',
                    borderColor: active ? alpha(t.accent, 0.3) : t.border,
                    transition: 'all 0.2s',
                    '& .MuiChip-icon': { color: active ? t.accent : 'text.disabled', ml: 0.5 },
                    '&:hover': {
                      bgcolor: active ? t.accentMuted : alpha(t.accent, 0.05),
                      borderColor: t.accent, color: t.accent,
                      '& .MuiChip-icon': { color: t.accent },
                    },
                  }}
                />
              );
            })}
            {hasFilters && (
              <Chip
                label="Clear"
                onClick={() => { setQ(''); setType(''); }}
                variant="outlined"
                sx={{
                  height: 34, fontSize: '0.8125rem', fontWeight: 500,
                  color: 'text.disabled', borderColor: t.borderSubtle,
                  '&:hover': { borderColor: 'error.main', color: 'error.main' },
                }}
              />
            )}
          </Stack>

          {!isLoading && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5 }}>
              {internships.length} {internships.length === 1 ? 'result' : 'results'}
              {q && <> · <strong style={{ color: t.accent }}>&ldquo;{q}&rdquo;</strong></>}
              {type && <> · <strong style={{ color: t.accent }}>{type}</strong></>}
            </Typography>
          )}
        </Box>
      </FadeIn>

      {/* Results */}
      <Grid container spacing={2}>
        {isLoading
          ? [1, 2, 3].map((i) => (
            <Grid item xs={12} key={i}>
              <Box className="skeleton-shimmer" sx={{ height: 110, borderRadius: '14px' }} />
            </Grid>
          ))
          : internships.map((job, i) => (
            <Grid item xs={12} key={job.id}>
              <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                <Box
                  component={RouterLink}
                  to={`/student/internships/${job.id}`}
                  sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <PremiumCard>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>

                        {/* Company avatar */}
                        <Box
                          sx={{
                            width: { xs: 40, sm: 46 }, height: { xs: 40, sm: 46 },
                            borderRadius: '11px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${alpha(t.accent, 0.14)}, ${alpha(t.accent, 0.05)})`,
                            border: `1px solid ${alpha(t.accent, 0.14)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: t.accent, fontWeight: 800,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {job.company?.name?.[0]?.toUpperCase() || '?'}
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle1" fontWeight={700}
                                sx={{ letterSpacing: '-0.01em', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {job.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.25 }}>
                                {job.company?.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                              <Typography fontWeight={700} sx={{ letterSpacing: '-0.02em', fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>
                                ₹{job.stipend?.min?.toLocaleString()}–{job.stipend?.max?.toLocaleString()}
                                <Typography component="span" variant="caption" color="text.secondary"> /mo</Typography>
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.5, color: t.accent }}>
                                <Typography variant="caption" fontWeight={600} sx={{ color: 'inherit' }}>Apply</Typography>
                                <ArrowForwardIcon sx={{ fontSize: 11 }} />
                              </Box>
                            </Box>
                          </Box>

                          <Stack direction="row" spacing={1.5} flexWrap="wrap" rowGap={0.5} sx={{ mt: 1, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>{job.location}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>{job.durationWeeks}w</Typography>
                            </Box>
                            <Box sx={{
                              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                              px: 0.75, py: 0.15, borderRadius: '4px', textTransform: 'uppercase',
                              bgcolor: t.accentMuted, color: t.accent, lineHeight: '18px',
                            }}>
                              {job.type}
                            </Box>
                          </Stack>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minWidth: 0 }}>
                              {job.skills?.slice(0, 4).map((s) => {
                                const isMatch = q && s.toLowerCase().includes(q.toLowerCase());
                                return (
                                  <Chip key={s} label={s} size="small"
                                    variant={isMatch ? 'filled' : 'outlined'}
                                    sx={{
                                      height: 22, fontSize: '0.7rem',
                                      ...(isMatch && { bgcolor: t.accentMuted, color: t.accent, borderColor: alpha(t.accent, 0.3), fontWeight: 600 }),
                                    }}
                                  />
                                );
                              })}
                            </Box>
                            <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                              <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}>
                                ₹{job.stipend?.min?.toLocaleString()}
                              </Typography>
                              <ArrowForwardIcon sx={{ fontSize: 12, color: t.accent }} />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </PremiumCard>
                </Box>
              </FadeIn>
            </Grid>
          ))}
      </Grid>

      {!isLoading && internships.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom color="text.secondary">
            No internships found
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
            Try a different role, skill, company, or location.
          </Typography>
          {hasFilters && (
            <Chip label="Clear filters" onClick={() => { setQ(''); setType(''); }} sx={{ cursor: 'pointer' }} />
          )}
        </Box>
      )}
    </Box>
  );
}
