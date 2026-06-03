import { Typography, CardContent, Box } from '@mui/material';
import { useGetCompanyInternshipsQuery } from '../../api/internshipApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';

export default function CompanyInternshipsPage() {
  const { data } = useGetCompanyInternshipsQuery(undefined);
  const jobs = data?.data || [];

  return (
    <Box>
      <PageHeader title="My internships" subtitle="Manage your listings and track performance." />
      {jobs.map((job: { id: string; title: string; status: string; applicationCount?: number }, i: number) => (
        <FadeIn key={job.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography fontWeight={600}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary">{job.applicationCount || 0} applications</Typography>
              </Box>
              <StatusChip status={job.status} />
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}
    </Box>
  );
}
