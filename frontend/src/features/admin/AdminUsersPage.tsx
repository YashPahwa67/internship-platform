import { Typography, CardContent, Box, Button } from '@mui/material';
import { useGetUsersQuery, useUpdateUserStatusMutation } from '../../api/adminApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';

export default function AdminUsersPage() {
  const { data, refetch } = useGetUsersQuery({});
  const [updateStatus] = useUpdateUserStatusMutation();
  const users = data?.data || [];

  const toggleSuspend = async (id: string, current: string) => {
    await updateStatus({ id, status: current === 'active' ? 'suspended' : 'active' });
    refetch();
  };

  return (
    <Box>
      <PageHeader title="User management" subtitle="View and manage platform users." />
      {users.map((u: { id: string; email: string; role: string; status: string; firstName?: string; lastName?: string }, i: number) => (
        <FadeIn key={u.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography fontWeight={600}>{u.firstName} {u.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">{u.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <StatusChip status={u.role} />
                <StatusChip status={u.status} />
                <Button size="small" variant="outlined" color="inherit" onClick={() => toggleSuspend(u.id, u.status)}>
                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}
    </Box>
  );
}
