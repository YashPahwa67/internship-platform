import { Typography, CardContent, Box, Button } from '@mui/material';
import { useGetPendingInternshipsQuery, useApproveInternshipMutation } from '../../api/internshipApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function AdminModerationPage() {
  const { data, refetch } = useGetPendingInternshipsQuery(undefined);
  const [approve] = useApproveInternshipMutation();
  const items = data?.data || [];

  const handleApprove = async (id: string, approved: boolean) => {
    await approve({ id, approved });
    refetch();
  };

  return (
    <Box>
      <PageHeader title="Internship moderation" subtitle={`${items.length} listings pending review`} />
      {items.map((job: { id: string; title: string; company?: { name: string }; description: string }, i: number) => (
        <FadeIn key={job.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={600}>{job.title}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{job.company?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {job.description}
              </Typography>
              <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={() => handleApprove(job.id, true)}>Approve</Button>
              <Button variant="outlined" color="inherit" size="small" onClick={() => handleApprove(job.id, false)}>Reject</Button>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}
      {items.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No internships pending review.</Typography>
      )}
    </Box>
  );
}
