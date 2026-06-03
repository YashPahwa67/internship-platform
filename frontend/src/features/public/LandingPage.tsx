import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, TextField, InputAdornment, CardContent, alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useState } from 'react';
import { useGetInternshipsQuery } from '../../api/internshipApi';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';
import FadeIn from '../../components/ui/FadeIn';
import PremiumCard from '../../components/ui/PremiumCard';
import StatCard from '../../components/ui/StatCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetInternshipsQuery({ limit: 3 });
  const internships = data?.data || [];
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: t.heroGradient,
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Box className="hero-grid" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                letterSpacing: '0.12em',
                fontWeight: 600,
                display: 'block',
                mb: 2,
              }}
            >
              INTERNSHIP MANAGEMENT PLATFORM
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.04em',
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                mb: 2,
              }}
            >
              Find your next
              <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                career-defining internship
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, maxWidth: 520, mb: 4, lineHeight: 1.6 }}
            >
              Connect with top companies. Track applications. Complete tasks — all in one elegant platform.
            </Typography>
          </FadeIn>

          <FadeIn delay={1}>
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'column', sm: 'row' },
                p: 0.75,
                borderRadius: 3,
                border: `1px solid ${t.border}`,
                bgcolor: 'background.paper',
                boxShadow: t.shadowMd,
                maxWidth: 560,
              }}
              className="glass-panel"
            >
              <TextField
                fullWidth
                placeholder="Search internships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/internships?q=${encodeURIComponent(search)}`)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
                    </InputAdornment>
                  ),
                  sx: { py: 1.25, px: 0.5 },
                }}
              />
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(`/internships${search ? `?q=${encodeURIComponent(search)}` : ''}`)}
                sx={{ px: 3, borderRadius: 2.5, whiteSpace: 'nowrap' }}
              >
                Search
              </Button>
            </Box>
          </FadeIn>
        </Container>
      </Box>

      {/* Stats */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, mt: { md: -4 }, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StatCard label="Students" value="50K+" icon={<SchoolOutlinedIcon />} delay={0} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard label="Companies" value="500+" icon={<BusinessOutlinedIcon />} delay={1} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard label="Placement rate" value="95%" icon={<TrendingUpOutlinedIcon />} delay={2} />
          </Grid>
        </Grid>
      </Container>

      {/* Featured */}
      <Box sx={{ bgcolor: t.bgMuted, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em" gutterBottom>
              Featured internships
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
              Hand-picked opportunities from verified companies.
            </Typography>
          </FadeIn>
          <Grid container spacing={2}>
            {isLoading
              ? [1, 2, 3].map((i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Box className="skeleton-shimmer" sx={{ height: 160, borderRadius: 4 }} />
                </Grid>
              ))
              : internships.map((job: {
                id: string; title: string; company?: { name: string };
                type: string; stipend?: { min: number; max: number };
              }, i: number) => (
                <Grid item xs={12} md={4} key={job.id}>
                  <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                    <PremiumCard onClick={() => navigate(`/internships/${job.id}`)}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {job.type}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5, mb: 0.5 }}>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.company?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
                          ₹{job.stipend?.min?.toLocaleString()} – ₹{job.stipend?.max?.toLocaleString()}/mo
                        </Typography>
                      </CardContent>
                    </PremiumCard>
                  </FadeIn>
                </Grid>
              ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={RouterLink} to="/internships" variant="outlined" size="large" endIcon={<ArrowForwardIcon />}>
              View all internships
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How it works */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <FadeIn>
          <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em" align="center" gutterBottom>
            How it works
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ mb: 6, maxWidth: 400, mx: 'auto' }}>
            Four simple steps to launch your internship journey.
          </Typography>
        </FadeIn>
        <Grid container spacing={3}>
          {['Register', 'Apply', 'Intern', 'Get certified'].map((step, i) => (
            <Grid item xs={6} md={3} key={step}>
              <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{
                      color: alpha(t.text, 0.08),
                      fontSize: { xs: '3rem', md: '4rem' },
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </Typography>
                  <Typography fontWeight={600}>{step}</Typography>
                </Box>
              </FadeIn>
            </Grid>
          ))}
        </Grid>
        <FadeIn delay={2}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ px: 4 }}>
              Get started free
            </Button>
          </Box>
        </FadeIn>
      </Container>
    </>
  );
}
