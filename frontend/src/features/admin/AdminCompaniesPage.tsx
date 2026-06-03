import { Typography, CardContent, Box, Button } from '@mui/material';
import { useGetPendingCompaniesQuery, useApproveCompanyMutation } from '../../api/adminApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function AdminCompaniesPage() {
  const { data, refetch } = useGetPendingCompaniesQuery(undefined);
  const [approve] = useApproveCompanyMutation();
  const companies = data?.data || [];

  const handleApprove = async (id: string, approved: boolean) => {
    await approve({ id, approved });
    refetch();
  };

  return (
    <Box>
      <PageHeader title="Pending companies" subtitle="Review and approve company registrations." />
      {companies.map((c: { id: string; name: string; industry?: string }, i: number) => (
        <FadeIn key={c.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography fontWeight={600}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">{c.industry}</Typography>
              </Box>
              <Box>
                <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={() => handleApprove(c.id, true)}>Approve</Button>
                <Button variant="outlined" color="inherit" size="small" onClick={() => handleApprove(c.id, false)}>Reject</Button>
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}
      {companies.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No pending companies.</Typography>
      )}
    </Box>
  );
}
