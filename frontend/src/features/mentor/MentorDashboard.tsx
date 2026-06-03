import { Typography, Box } from '@mui/material';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function MentorDashboard() {
  return (
    <Box>
      <PageHeader title="Mentor dashboard" subtitle="Supervise interns and review their progress." />
      <FadeIn>
        <PremiumCard hover={false}>
          <Box sx={{ p: 4 }}>
            <Typography color="text.secondary" lineHeight={1.7}>
              Full mentor features (assigned interns, attendance, evaluations) arrive in Phase 2.
              Company HR can assign and review tasks from the Candidates page in the meantime.
            </Typography>
          </Box>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
