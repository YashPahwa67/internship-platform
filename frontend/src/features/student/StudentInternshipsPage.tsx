import { useState, useMemo, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography, CardContent, Grid, Chip, Box, Button,
  TextField, InputAdornment, Stack, alpha, Collapse,
  Slider, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
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

const POPULAR_SKILLS = ['React', 'Python', 'Node.js', 'Machine Learning', 'UI/UX', 'Data Analysis', 'Java', 'Marketing', 'Content Writing', 'Android'];

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
    (job.skills?.some((s) => s.toLowerCase().includes(lower)) ?? false) ||
    (job.description?.toLowerCase().includes(lower) ?? false)
  );
}

const DEFAULT_STIPEND: [number, number] = [0, 100000];
const DEFAULT_DURATION: [number, number] = [1, 52];

export default function StudentInternshipsPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stipend, setStipend] = useState<[number, number]>(DEFAULT_STIPEND);
  const [duration, setDuration] = useState<[number, number]>(DEFAULT_DURATION);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const { data, isLoading, isFetching, refetch } = useGetInternshipsQuery(
    { limit: 100 },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  );
  const all = (data?.data || []) as Internship[];

  const toggleSkill = useCallback((skill: string) => {
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  }, []);

  const hasAdvancedFilters =
    stipend[0] !== DEFAULT_STIPEND[0] || stipend[1] !== DEFAULT_STIPEND[1] ||
    duration[0] !== DEFAULT_DURATION[0] || duration[1] !== DEFAULT_DURATION[1] ||
    selectedSkills.length > 0;

  const hasAnyFilter = q || type || hasAdvancedFilters;

  const clearAll = () => {
    setQ(''); setType('');
    setStipend(DEFAULT_STIPEND); setDuration(DEFAULT_DURATION);
    setSelectedSkills([]);
  };

  const internships = useMemo(() => {
    return all.filter((job) => {
      if (type && job.type !== type) return false;
      if (q && !matchesQuery(job, q)) return false;
      const min = job.stipend?.min ?? 0;
      if (min < stipend[0] || min > stipend[1]) return false;
      const dur = job.durationWeeks ?? 0;
      if (dur < duration[0] || dur > duration[1]) return false;
      if (selectedSkills.length > 0 && !selectedSkills.some((s) => job.skills?.includes(s))) return false;
      return true;
    });
  }, [all, q, type, stipend, duration, selectedSkills]);

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

      <FadeIn>
        <Box sx={{ mb: 3 }}>
          {/* Search bar + filter toggle */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Role, skill, company or location…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ flex: 1, minWidth: 200, maxWidth: 460 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant={showFilters || hasAdvancedFilters ? 'contained' : 'outlined'}
              color={hasAdvancedFilters ? 'primary' : 'inherit'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters((v) => !v)}
              sx={{ height: 40, borderRadius: '10px', fontWeight: 600 }}
            >
              Filters
              {hasAdvancedFilters && (
                <Box component="span" sx={{
                  ml: 0.75, width: 18, height: 18, borderRadius: '50%',
                  bgcolor: 'white', color: t.accent, fontSize: '0.7rem',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                }}>
                  {(stipend[0] !== DEFAULT_STIPEND[0] || stipend[1] !== DEFAULT_STIPEND[1] ? 1 : 0) +
                   (duration[0] !== DEFAULT_DURATION[0] || duration[1] !== DEFAULT_DURATION[1] ? 1 : 0) +
                   (selectedSkills.length > 0 ? 1 : 0)}
                </Box>
              )}
            </Button>
          </Box>

          {/* Type filter chips */}
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
            {hasAnyFilter && (
              <Chip
                label="Clear all"
                onClick={clearAll}
                variant="outlined"
                sx={{ height: 34, fontSize: '0.8125rem', fontWeight: 500, color: 'text.disabled', borderColor: t.borderSubtle, '&:hover': { borderColor: 'error.main', color: 'error.main' } }}
              />
            )}
          </Stack>

          {/* Advanced filter panel */}
          <Collapse in={showFilters}>
            <PremiumCard hover={false} sx={{ mt: 2, p: 0 }}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  {/* Stipend range */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Stipend range
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      ₹{stipend[0].toLocaleString()} – ₹{stipend[1].toLocaleString()}/mo
                    </Typography>
                    <Slider
                      value={stipend}
                      onChange={(_, v) => setStipend(v as [number, number])}
                      min={0} max={100000} step={5000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      sx={{ color: t.accent }}
                    />
                  </Grid>

                  {/* Duration range */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Duration (weeks)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      {duration[0]} – {duration[1]} weeks
                    </Typography>
                    <Slider
                      value={duration}
                      onChange={(_, v) => setDuration(v as [number, number])}
                      min={1} max={52} step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${v}w`}
                      sx={{ color: t.accent }}
                    />
                  </Grid>

                  {/* Skills */}
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2.5, borderColor: t.border }} />
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Skills
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" rowGap={0.75}>
                      {POPULAR_SKILLS.map((skill) => {
                        const active = selectedSkills.includes(skill);
                        return (
                          <Chip
                            key={skill}
                            label={skill}
                            onClick={() => toggleSkill(skill)}
                            variant={active ? 'filled' : 'outlined'}
                            size="small"
                            sx={{
                              fontWeight: active ? 600 : 500, fontSize: '0.78rem',
                              bgcolor: active ? t.accentMuted : 'transparent',
                              color: active ? t.accent : 'text.secondary',
                              borderColor: active ? alpha(t.accent, 0.3) : t.border,
                              transition: 'all 0.18s',
                              '&:hover': { borderColor: t.accent, color: t.accent, bgcolor: alpha(t.accent, 0.05) },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </PremiumCard>
          </Collapse>

          {!isLoading && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5 }}>
              {internships.length} {internships.length === 1 ? 'result' : 'results'}
              {q && <> · <strong style={{ color: t.accent }}>&ldquo;{q}&rdquo;</strong></>}
              {type && <> · <strong style={{ color: t.accent }}>{type}</strong></>}
              {selectedSkills.length > 0 && <> · <strong style={{ color: t.accent }}>{selectedSkills.join(', ')}</strong></>}
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
                        <Box sx={{
                          width: { xs: 40, sm: 46 }, height: { xs: 40, sm: 46 },
                          borderRadius: '11px', flexShrink: 0,
                          background: `linear-gradient(135deg, ${alpha(t.accent, 0.14)}, ${alpha(t.accent, 0.05)})`,
                          border: `1px solid ${alpha(t.accent, 0.14)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: t.accent, fontWeight: 800, fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}>
                          {job.company?.name?.[0]?.toUpperCase() || '?'}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            <Box sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', px: 0.75, py: 0.15, borderRadius: '4px', textTransform: 'uppercase', bgcolor: t.accentMuted, color: t.accent, lineHeight: '18px' }}>
                              {job.type}
                            </Box>
                          </Stack>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minWidth: 0 }}>
                              {job.skills?.slice(0, 4).map((s) => {
                                const isMatch = (q && s.toLowerCase().includes(q.toLowerCase())) || selectedSkills.includes(s);
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
            Try adjusting your filters or search term.
          </Typography>
          {hasAnyFilter && (
            <Chip label="Clear all filters" onClick={clearAll} sx={{ cursor: 'pointer' }} />
          )}
        </Box>
      )}
    </Box>
  );
}
