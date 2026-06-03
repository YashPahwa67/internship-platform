import { Typography, CardContent, Box, Button } from '@mui/material';
import { useGetApplicationsQuery, useWithdrawApplicationMutation } from '../../api/applicationApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';

export default function StudentApplicationsPage() {
  const { data, refetch } = useGetApplicationsQuery({});
  const [withdraw] = useWithdrawApplicationMutation();
  const applications = data?.data || [];

  const handleWithdraw = async (id: string) => {
    await withdraw(id);
    refetch();
  };

  return (
    <Box>
      <PageHeader title="My applications" subtitle="Track status and manage your active applications." />
      {applications.map((a: { id: string; status: string; appliedAt: string; internship?: { title: string } }, i: number) => (
        <FadeIn key={a.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 3 }}>
              <Box>
                <Typography fontWeight={600}>{a.internship?.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Applied {new Date(a.appliedAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <StatusChip status={a.status} />
                {['applied', 'shortlisted'].includes(a.status) && (
                  <Button size="small" variant="outlined" color="inherit" onClick={() => handleWithdraw(a.id)}>
                    Withdraw
                  </Button>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}
      {applications.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          No applications yet. Browse internships to apply.
        </Typography>
      )}
    </Box>
  );
}
