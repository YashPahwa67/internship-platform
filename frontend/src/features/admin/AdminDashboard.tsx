import { Grid, Typography, Box } from '@mui/material';
import { useGetAnalyticsQuery } from '../../api/adminApi';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function AdminDashboard() {
  const { data } = useGetAnalyticsQuery(undefined);
  const stats = data?.data;

  const cards = [
    { label: 'Total users', value: stats?.users ?? 0 },
    { label: 'Students', value: stats?.students ?? 0 },
    { label: 'Companies', value: stats?.companies ?? 0 },
    { label: 'Applications', value: stats?.applications ?? 0 },
    { label: 'Published', value: stats?.publishedInternships ?? 0 },
  ];

  return (
    <Box>
      <PageHeader title="Platform analytics" subtitle="Overview of platform health and activity." />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cards.map((c, i) => (
          <Grid item xs={6} md={4} key={c.label}>
            <StatCard label={c.label} value={c.value} delay={(i % 3) as 0 | 1 | 2} />
          </Grid>
        ))}
      </Grid>
      {stats?.applicationsByStatus && (
        <FadeIn>
          <Typography variant="h6" fontWeight={600} gutterBottom>Applications by status</Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
              <Grid item xs={6} md={3} key={status}>
                <PremiumCard hover={false}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h5" fontWeight={700}>{count as number}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {status.replace(/_/g, ' ')}
                    </Typography>
                  </Box>
                </PremiumCard>
              </Grid>
            ))}
          </Grid>
        </FadeIn>
      )}
    </Box>
  );
}
