import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, CardContent, Grid, Chip, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetInternshipsQuery } from '../../api/internshipApi';
import FadeIn from '../../components/ui/FadeIn';
import PremiumCard from '../../components/ui/PremiumCard';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

export default function InternshipBrowsePage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { data, isLoading } = useGetInternshipsQuery({ q: q || undefined, limit: 20 });
  const internships = data?.data || [];
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <FadeIn>
        <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em" gutterBottom>
          Browse internships
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Discover opportunities from verified companies.</Typography>
      </FadeIn>
      <FadeIn delay={1}>
        <TextField
          fullWidth
          placeholder="Search by title or skills..."
          value={q}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})}
          sx={{ mb: 4, maxWidth: 480 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </FadeIn>
      <Grid container spacing={2}>
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
            <Grid item xs={12} key={i}>
              <Box className="skeleton-shimmer" sx={{ height: 100, borderRadius: 4 }} />
            </Grid>
          ))
          : internships.map((job: {
            id: string; title: string; company?: { name: string };
            type: string; location: string; skills: string[];
            stipend?: { min: number; max: number }; durationWeeks: number;
          }, i: number) => (
            <Grid item xs={12} key={job.id}>
              <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                <Box component={RouterLink} to={`/internships/${job.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <PremiumCard>
                  <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {job.type} · {job.location}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{job.company?.name}</Typography>
                      <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {job.skills?.slice(0, 4).map((s: string) => (
                          <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: t.border }} />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography fontWeight={600}>
                        ₹{job.stipend?.min?.toLocaleString()} – ₹{job.stipend?.max?.toLocaleString()}/mo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{job.durationWeeks} weeks</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: 'text.secondary' }}>
                        <Typography variant="body2">View</Typography>
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
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
        <Typography color="text.secondary" align="center" sx={{ py: 10 }}>
          No internships found. Try a different search.
        </Typography>
      )}
    </Container>
  );
}
