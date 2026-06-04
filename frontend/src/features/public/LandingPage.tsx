import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, TextField, InputAdornment,
  CardContent, alpha, Stack, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from 'react';
import { useGetInternshipsQuery } from '../../api/internshipApi';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';
import FadeIn from '../../components/ui/FadeIn';
import PremiumCard from '../../components/ui/PremiumCard';
import StatCard from '../../components/ui/StatCard';

const STEPS = [
  { num: '01', title: 'Create profile', desc: 'Build your professional profile with skills, projects, and resume.' },
  { num: '02', title: 'Apply', desc: 'Discover and apply to curated internships matching your goals.' },
  { num: '03', title: 'Intern', desc: 'Complete tasks, get mentored, and build real-world experience.' },
  { num: '04', title: 'Get certified', desc: 'Earn a verified certificate on successful completion.' },
];

const FEATURES = [
  { icon: <VerifiedOutlinedIcon />, title: 'Verified companies', desc: 'Every company is vetted before listing. No scams, no ghost internships.' },
  { icon: <BoltOutlinedIcon />, title: 'Fast application', desc: 'Apply in under 60 seconds with your saved profile and resume.' },
  { icon: <EmojiEventsOutlinedIcon />, title: 'Track progress', desc: 'Live task board, mentor feedback, and milestone tracking.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetInternshipsQuery({ limit: 3 });
  const internships = data?.data || [];
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: t.heroGradient,
          pt: { xs: 7, md: 12 },
          pb: { xs: 9, md: 14 },
        }}
      >
        {/* ambient orbs */}
        <Box className="orb orb-1" />
        <Box className="orb orb-2" />
        <Box className="hero-grid" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <FadeIn>
            {/* badge */}
            <Box sx={{ mb: 3 }}>
              <Box
                component="span"
                className="badge-accent animate-scale-in"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3D63F8, #7B6CF8)',
                    flexShrink: 0,
                  }}
                />
                Internship Management Platform
              </Box>
            </Box>

            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.045em',
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem', lg: '4.5rem' },
                lineHeight: 1.06,
                mb: 1.5,
              }}
            >
              Land your next
            </Typography>
            <Typography
              variant="h1"
              component="div"
              className="gradient-text"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.045em',
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem', lg: '4.5rem' },
                lineHeight: 1.06,
                mb: 3,
              }}
            >
              career-defining internship.
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, maxWidth: 500, mb: 5, lineHeight: 1.65, fontSize: { xs: '1rem', md: '1.125rem' } }}
            >
              Connect with top companies. Track applications. Complete tasks — all in one elegant, unified platform.
            </Typography>
          </FadeIn>

          <FadeIn delay={1}>
            {/* search bar */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                p: 0.75,
                borderRadius: '14px',
                border: `1px solid ${t.border}`,
                bgcolor: 'background.paper',
                boxShadow: t.shadowLg,
                maxWidth: 580,
                mb: 5,
              }}
              className="glass-panel"
            >
              <TextField
                fullWidth
                placeholder="Search by role, skill, or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/internships?q=${encodeURIComponent(search)}`)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.disabled', ml: 1.5, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { py: 1.25, px: 0.5, fontSize: '0.9375rem' },
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/internships${search ? `?q=${encodeURIComponent(search)}` : ''}`)}
                sx={{ px: 3, borderRadius: '10px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Search
              </Button>
            </Box>

            {/* social proof row */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" rowGap={1}>
              {['React', 'Machine Learning', 'Finance', 'Design', 'DevOps'].map((tag) => (
                <Box
                  key={tag}
                  component="button"
                  onClick={() => navigate(`/internships?q=${encodeURIComponent(tag)}`)}
                  sx={{
                    background: 'none',
                    border: `1px solid ${t.border}`,
                    borderRadius: '99px',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: t.accent, color: t.accent, bgcolor: t.accentMuted },
                  }}
                >
                  {tag}
                </Box>
              ))}
              <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                Popular searches
              </Typography>
            </Stack>
          </FadeIn>
        </Container>
      </Box>

      {/* ── Stats ───────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, mt: { md: -5 }, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <StatCard label="Students placed" value="50K+" icon={<SchoolOutlinedIcon />} delay={0} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard label="Partner companies" value="500+" icon={<BusinessOutlinedIcon />} delay={1} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard label="Placement rate" value="95%" icon={<TrendingUpOutlinedIcon />} delay={2} />
          </Grid>
        </Grid>
      </Container>

      {/* ── Features ────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: `1px solid ${t.borderSubtle}`,
          borderBottom: `1px solid ${t.borderSubtle}`,
          py: { xs: 7, md: 10 },
          bgcolor: t.bgMuted,
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant="overline" sx={{ color: t.accent, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}>
                Why IMP
              </Typography>
              <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em">
                Everything you need, nothing you don&apos;t
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={3}>
            {FEATURES.map((f, i) => (
              <Grid item xs={12} md={4} key={f.title}>
                <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                  <PremiumCard hover sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3.5 }}>
                      <Box
                        sx={{
                          width: 44, height: 44, borderRadius: '12px',
                          background: t.accentGradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', mb: 2.5,
                          '& svg': { fontSize: 22 },
                        }}
                      >
                        {f.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{f.desc}</Typography>
                    </CardContent>
                  </PremiumCard>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Featured Internships ─────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <FadeIn>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 5 }}>
            <Box>
              <Typography variant="overline" sx={{ color: t.accent, letterSpacing: '0.12em', mb: 1, display: 'block' }}>
                Featured
              </Typography>
              <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em">
                Top internships right now
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/internships"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              View all
            </Button>
          </Stack>
        </FadeIn>

        <Grid container spacing={2.5}>
          {isLoading
            ? [1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box className="skeleton-shimmer" sx={{ height: 200, borderRadius: 4 }} />
              </Grid>
            ))
            : internships.map((job: {
              id: string; title: string; company?: { name: string };
              type: string; stipend?: { min: number; max: number }; skills?: string[];
            }, i: number) => (
              <Grid item xs={12} md={4} key={job.id}>
                <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                  <PremiumCard onClick={() => navigate(`/internships/${job.id}`)} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* type pill */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box
                          component="span"
                          sx={{
                            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
                            px: 1.25, py: 0.4, borderRadius: '6px',
                            bgcolor: t.accentMuted, color: t.accent,
                            textTransform: 'uppercase',
                          }}
                        >
                          {job.type?.replace(/_/g, ' ')}
                        </Box>
                        <CheckCircleOutlineIcon sx={{ color: alpha(t.accent, 0.4), fontSize: 18 }} />
                      </Box>

                      {/* company avatar placeholder + name */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box
                          sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: `linear-gradient(135deg, ${alpha(t.accent, 0.15)}, ${alpha(t.accent, 0.05)})`,
                            border: `1px solid ${alpha(t.accent, 0.15)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: t.accent, fontWeight: 700, fontSize: '0.875rem',
                          }}
                        >
                          {job.company?.name?.[0] || '?'}
                        </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {job.company?.name}
                        </Typography>
                      </Box>

                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3, mb: 1.5, letterSpacing: '-0.01em' }}>
                        {job.title}
                      </Typography>

                      <Box sx={{ flexGrow: 1 }} />

                      <Divider sx={{ my: 2, borderColor: t.borderSubtle }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          ₹{job.stipend?.min?.toLocaleString()}–{job.stipend?.max?.toLocaleString()}
                          <Typography component="span" variant="caption" color="text.secondary"> /mo</Typography>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: t.accent }}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: 'inherit', fontSize: '0.8125rem' }}>
                            Apply
                          </Typography>
                          <ArrowForwardIcon sx={{ fontSize: 14 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </PremiumCard>
                </FadeIn>
              </Grid>
            ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 5, display: { sm: 'none' } }}>
          <Button component={RouterLink} to="/internships" variant="outlined" size="large" endIcon={<ArrowForwardIcon />}>
            View all internships
          </Button>
        </Box>
      </Container>

      {/* ── How it works ─────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: t.bgMuted,
          borderTop: `1px solid ${t.borderSubtle}`,
          py: { xs: 7, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: t.accent, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}>
                Process
              </Typography>
              <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em">
                From sign-up to certified
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 420, mx: 'auto' }}>
                Four straightforward steps to launch your internship journey.
              </Typography>
            </Box>
          </FadeIn>

          <Grid container spacing={3}>
            {STEPS.map((step, i) => (
              <Grid item xs={12} sm={6} md={3} key={step.num}>
                <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                  <Box sx={{ position: 'relative' }}>
                    {/* connector line (not on last) */}
                    {i < STEPS.length - 1 && (
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          position: 'absolute',
                          top: 20,
                          left: '60%',
                          right: '-10%',
                          height: 1,
                          background: `linear-gradient(90deg, ${t.border}, transparent)`,
                          zIndex: 0,
                        }}
                      />
                    )}
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          width: 40, height: 40, borderRadius: '10px',
                          background: t.accentGradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff', letterSpacing: '-0.02em' }}>
                          {step.num}
                        </Typography>
                      </Box>
                      <Typography fontWeight={700} sx={{ mb: 0.75, fontSize: '1rem' }}>{step.title}</Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.65}>{step.desc}</Typography>
                    </Box>
                  </Box>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 14 }, position: 'relative', overflow: 'hidden' }}>
        <Box className="orb orb-3" sx={{ opacity: 0.6 }} />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <FadeIn>
            <Typography variant="h3" fontWeight={800} letterSpacing="-0.035em" gutterBottom>
              Ready to start your journey?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 5, fontSize: '1.0625rem', lineHeight: 1.65 }}>
              Join 50,000+ students who found their first role through IMP.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{ px: 5, fontSize: '1rem' }}
              >
                Get started free
              </Button>
              <Button
                component={RouterLink}
                to="/internships"
                variant="outlined"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 4, fontSize: '1rem' }}
              >
                Browse internships
              </Button>
            </Stack>
          </FadeIn>
        </Container>
      </Box>
    </>
  );
}
