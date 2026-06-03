import { Link as RouterLink } from 'react-router-dom';
import { Typography, CardContent, Grid, Chip, Box, Button } from '@mui/material';
import { useGetInternshipsQuery } from '../../api/internshipApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

export default function StudentInternshipsPage() {
  const { data, isLoading, isFetching, refetch } = useGetInternshipsQuery(
    { limit: 50 },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  );
  const internships = data?.data || [];
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <Box>
      <PageHeader
        title="Internships"
        subtitle="Explore and apply to opportunities that match your skills."
        action={
          <Button size="small" variant="outlined" color="inherit" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />
      <Grid container spacing={2}>
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Grid item xs={12} key={i}>
                <Box className="skeleton-shimmer" sx={{ height: 100, borderRadius: 4 }} />
              </Grid>
            ))
          : internships.map(
              (
                job: {
                  id: string;
                  title: string;
                  company?: { name: string };
                  type: string;
                  skills: string[];
                  stipend?: { min: number; max: number };
                },
                i: number
              ) => (
                <Grid item xs={12} key={job.id}>
                  <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                    <Box
                      component={RouterLink}
                      to={`/student/internships/${job.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <PremiumCard>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {job.type}
                          </Typography>
                          <Typography fontWeight={600} sx={{ mt: 0.5 }}>
                            {job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.company?.name}
                          </Typography>
                          <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5 }}>
                            {job.skills?.slice(0, 3).map((s: string) => (
                              <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: t.border }} />
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500 }}>
                            ₹{job.stipend?.min?.toLocaleString()}–{job.stipend?.max?.toLocaleString()}/mo
                          </Typography>
                        </CardContent>
                      </PremiumCard>
                    </Box>
                  </FadeIn>
                </Grid>
              )
            )}
      </Grid>
      {!isLoading && internships.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          No internships available right now. Try Refresh in a moment.
        </Typography>
      )}
    </Box>
  );
}
