import { Grid, CardContent, Typography, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetApplicationsQuery } from '../../api/applicationApi';
import { useGetTasksQuery } from '../../api/taskApi';
import { useGetInternshipsQuery } from '../../api/internshipApi';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../auth/authSlice';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function StudentDashboard() {
  const user = useAppSelector(selectUser);
  const { data: apps } = useGetApplicationsQuery({});
  const { data: tasks } = useGetTasksQuery({});
  const { data: internships } = useGetInternshipsQuery({ limit: 3 });

  const applications = apps?.data || [];
  const taskList = tasks?.data || [];
  const pendingTasks = taskList.filter((t: { status: string }) => t.status === 'pending').length;

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        subtitle="Track your applications, tasks, and discover new opportunities."
      />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Applications" value={applications.length} delay={0} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="In progress"
            value={applications.filter((a: { status: string }) => ['shortlisted', 'interview_scheduled', 'offered', 'active'].includes(a.status)).length}
            delay={1}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Tasks due" value={pendingTasks} delay={2} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Completed" value={applications.filter((a: { status: string }) => a.status === 'completed').length} delay={3} />
        </Grid>
      </Grid>

      <FadeIn>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Recommended</Typography>
          <Button component={RouterLink} to="/student/internships" size="small" endIcon={<ArrowForwardIcon />}>
            View all
          </Button>
        </Box>
      </FadeIn>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(internships?.data || []).map((job: { id: string; title: string; company?: { name: string } }, i: number) => (
          <Grid item xs={12} md={4} key={job.id}>
            <FadeIn delay={(i % 3) as 0 | 1 | 2}>
              <Box component={RouterLink} to={`/student/internships/${job.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <PremiumCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography fontWeight={600}>{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{job.company?.name}</Typography>
                  </CardContent>
                </PremiumCard>
              </Box>
            </FadeIn>
          </Grid>
        ))}
      </Grid>

      <FadeIn delay={1}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Recent activity</Typography>
        <PremiumCard hover={false}>
          <List disablePadding>
            {applications.slice(0, 5).map((a: { id: string; status: string; internship?: { title: string } }) => (
              <ListItem key={a.id} divider>
                <ListItemText
                  primary={a.internship?.title || 'Internship'}
                  secondary={`Status: ${a.status.replace(/_/g, ' ')}`}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}
            {applications.length === 0 && (
              <ListItem>
                <ListItemText primary="No applications yet" secondary="Browse internships to get started" />
              </ListItem>
            )}
          </List>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
