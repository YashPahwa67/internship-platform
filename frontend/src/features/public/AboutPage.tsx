import { Container, Typography, Grid, CardContent, Box } from '@mui/material';
import FadeIn from '../../components/ui/FadeIn';
import PremiumCard from '../../components/ui/PremiumCard';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const values = [
  { title: 'Transparency', desc: 'Track every application status in real time with full visibility.' },
  { title: 'Security', desc: 'Enterprise-grade authentication, RBAC, and comprehensive audit logs.' },
  { title: 'Growth', desc: 'Structured feedback loops between students, mentors, and companies.' },
];

export default function AboutPage() {
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <>
      <Box sx={{ bgcolor: t.bgMuted, py: { xs: 8, md: 10 }, borderBottom: `1px solid ${t.border}` }}>
        <Container maxWidth="md">
          <FadeIn>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 600 }}>
              ABOUT US
            </Typography>
            <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em" sx={{ mt: 1, mb: 2 }}>
              Building the future of internships
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, lineHeight: 1.7 }}>
              IMP bridges students, companies, mentors, and administrators in one cloud-native platform.
              We streamline discovery, applications, task management, evaluations, and digital certification.
            </Typography>
          </FadeIn>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          {values.map((v, i) => (
            <Grid item xs={12} md={4} key={v.title}>
              <FadeIn delay={(i % 3) as 0 | 1 | 2}>
                <PremiumCard hover={false} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>{v.title}</Typography>
                    <Typography color="text.secondary" variant="body2" lineHeight={1.7}>{v.desc}</Typography>
                  </CardContent>
                </PremiumCard>
              </FadeIn>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
