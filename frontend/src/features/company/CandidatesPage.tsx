import { useState } from 'react';
import {
  Typography, CardContent, Box, Button, MenuItem, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { useGetApplicationsQuery, useUpdateApplicationStatusMutation } from '../../api/applicationApi';
import { useCreateTaskMutation } from '../../api/taskApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const STATUSES = ['applied', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'];

export default function CandidatesPage() {
  const [filter, setFilter] = useState('');
  const { data, refetch } = useGetApplicationsQuery(filter ? { status: filter } : {});
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [createTask] = useCreateTaskMutation();
  const [taskDialog, setTaskDialog] = useState<{ applicationId: string; name: string } | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' });
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const applications = data?.data || [];

  const handleStatus = async (id: string, status: string) => {
    await updateStatus({ id, status });
    refetch();
  };

  const handleCreateTask = async () => {
    if (!taskDialog) return;
    await createTask({
      applicationId: taskDialog.applicationId,
      title: taskForm.title,
      description: taskForm.description,
      deadline: taskForm.deadline || undefined,
    });
    setTaskDialog(null);
    setTaskForm({ title: '', description: '', deadline: '' });
  };

  return (
    <Box>
      <PageHeader title="Candidates" subtitle="Review applicants and move them through your pipeline." />
      <TextField select size="small" label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ mb: 3, minWidth: 180 }}>
        <MenuItem value="">All</MenuItem>
        {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
      </TextField>
      {applications.map((a: { id: string; status: string; student?: { name: string; university?: string }; internship?: { title: string } }, i: number) => (
        <FadeIn key={a.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Box>
                  <Typography fontWeight={600}>{a.student?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.internship?.title} · {a.student?.university}</Typography>
                </Box>
                <StatusChip status={a.status} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {a.status === 'applied' && (
                  <>
                    <Button size="small" variant="contained" onClick={() => handleStatus(a.id, 'shortlisted')}>Shortlist</Button>
                    <Button size="small" variant="outlined" color="inherit" onClick={() => handleStatus(a.id, 'rejected')}>Reject</Button>
                  </>
                )}
                {a.status === 'shortlisted' && (
                  <Button size="small" variant="outlined" color="inherit" onClick={() => handleStatus(a.id, 'interview_scheduled')}>Schedule interview</Button>
                )}
                {a.status === 'interview_scheduled' && (
                  <Button size="small" variant="contained" onClick={() => handleStatus(a.id, 'offered')}>Send offer</Button>
                )}
                {['offered', 'accepted', 'active'].includes(a.status) && (
                  <Button size="small" variant="outlined" color="inherit" onClick={() => setTaskDialog({ applicationId: a.id, name: a.student?.name || '' })}>Assign task</Button>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}

      <Dialog open={!!taskDialog} onClose={() => setTaskDialog(null)} PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${t.border}` } }}>
        <DialogTitle fontWeight={600}>Assign task — {taskDialog?.name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} margin="normal" />
          <TextField fullWidth label="Description" multiline rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} margin="normal" />
          <TextField fullWidth type="date" label="Deadline" InputLabelProps={{ shrink: true }} value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTaskDialog(null)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreateTask}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
