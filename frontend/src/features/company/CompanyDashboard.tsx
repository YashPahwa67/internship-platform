import { Grid, Typography, Box, Button, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useGetCompanyInternshipsQuery } from '../../api/internshipApi';
import { useGetApplicationsQuery } from '../../api/applicationApi';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../auth/authSlice';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function CompanyDashboard() {
  const user = useAppSelector(selectUser);
  const { data: internships } = useGetCompanyInternshipsQuery(undefined);
  const { data: applications } = useGetApplicationsQuery({});
  const jobs = internships?.data || [];
  const apps = applications?.data || [];
  const pending = user?.company?.approvalStatus === 'pending';

  return (
    <Box>
      {pending && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Your company is pending admin approval. You cannot publish internships until approved.
        </Alert>
      )}
      <PageHeader
        title={user?.company?.name || 'Company dashboard'}
        subtitle="Manage listings, review candidates, and track hiring."
        action={
          <Button variant="contained" component={RouterLink} to="/company/internships/new">
            Post internship
          </Button>
        }
      />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}><StatCard label="Active listings" value={jobs.filter((j: { status: string }) => j.status === 'published').length} delay={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Applications" value={apps.length} delay={1} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Pending review" value={jobs.filter((j: { status: string }) => j.status === 'pending_review').length} delay={2} /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Shortlisted" value={apps.filter((a: { status: string }) => a.status === 'shortlisted').length} delay={3} /></Grid>
      </Grid>
      <FadeIn>
        <Typography variant="h6" fontWeight={600} gutterBottom>Recent applications</Typography>
        <PremiumCard hover={false}>
          <List disablePadding>
            {apps.slice(0, 5).map((a: { id: string; student?: { name: string }; internship?: { title: string }; status: string }) => (
              <ListItem key={a.id} divider secondaryAction={
                <Button size="small" component={RouterLink} to="/company/candidates">Review</Button>
              }>
                <ListItemText primary={`${a.student?.name} — ${a.internship?.title}`} secondary={a.status.replace(/_/g, ' ')} />
              </ListItem>
            ))}
            {apps.length === 0 && <ListItem><ListItemText primary="No applications yet" /></ListItem>}
          </List>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
