import { useState } from 'react';
import {
  Typography,
  CardContent,
  Box,
  Button,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useGetApplicationsQuery, useUpdateApplicationStatusMutation } from '../../api/applicationApi';
import { useCreateTaskMutation } from '../../api/taskApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';
import CandidateProfileView, { type CandidateProfile } from '../../components/company/CandidateProfileView';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const STATUSES = ['applied', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'];

type ApplicationRow = {
  id: string;
  status: string;
  coverLetter?: string;
  resumeAtApplication?: { url?: string; filename?: string };
  student?: CandidateProfile;
  internship?: { title: string };
};

export default function CandidatesPage() {
  const [filter, setFilter] = useState('');
  const { data, refetch, isFetching } = useGetApplicationsQuery(filter ? { status: filter } : {}, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [createTask] = useCreateTaskMutation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileDialogId, setProfileDialogId] = useState<string | null>(null);
  const [taskDialog, setTaskDialog] = useState<{ applicationId: string; name: string } | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' });
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const applications = (data?.data || []) as ApplicationRow[];
  const profileDialog = profileDialogId
    ? applications.find((a) => a.id === profileDialogId) ?? null
    : null;

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
      <PageHeader
        title="Candidates"
        subtitle="Live student profiles — education and resume update when candidates edit their profile."
        action={
          <Button size="small" variant="outlined" color="inherit" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />
      <TextField
        select
        size="small"
        label="Filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 3, minWidth: 180 }}
      >
        <MenuItem value="">All</MenuItem>
        {STATUSES.map((s) => (
          <MenuItem key={s} value={s}>
            {s.replace(/_/g, ' ')}
          </MenuItem>
        ))}
      </TextField>

      {applications.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          No applications yet.
        </Typography>
      )}

      {applications.map((a, i) => (
        <FadeIn key={a.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{a.student?.name || 'Candidate'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.internship?.title}
                    {a.student?.college ? ` · ${a.student.college}` : ''}
                  </Typography>
                  {a.student?.email && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {a.student.email}
                    </Typography>
                  )}
                </Box>
                <StatusChip status={a.status} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<PersonOutlineIcon />}
                  onClick={() => setProfileDialogId(a.id)}
                >
                  View profile
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                  aria-label={expandedId === a.id ? 'Collapse' : 'Expand'}
                >
                  {expandedId === a.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedId === a.id}>
                <Box
                  sx={{
                    pt: 2,
                    borderTop: `1px solid ${t.border}`,
                  }}
                >
                  <CandidateProfileView
                    student={a.student}
                    coverLetter={a.coverLetter}
                    resumeAtApplication={a.resumeAtApplication}
                  />
                </Box>
              </Collapse>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {a.status === 'applied' && (
                  <>
                    <Button size="small" variant="contained" onClick={() => handleStatus(a.id, 'shortlisted')}>
                      Shortlist
                    </Button>
                    <Button size="small" variant="outlined" color="inherit" onClick={() => handleStatus(a.id, 'rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {a.status === 'shortlisted' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleStatus(a.id, 'interview_scheduled')}
                  >
                    Schedule interview
                  </Button>
                )}
                {a.status === 'interview_scheduled' && (
                  <Button size="small" variant="contained" onClick={() => handleStatus(a.id, 'offered')}>
                    Send offer
                  </Button>
                )}
                {['offered', 'accepted', 'active'].includes(a.status) && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => setTaskDialog({ applicationId: a.id, name: a.student?.name || '' })}
                  >
                    Assign task
                  </Button>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}

      <Dialog
        open={!!profileDialogId}
        onClose={() => setProfileDialogId(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${t.border}` } }}
      >
        <DialogTitle fontWeight={600}>
          {profileDialog?.student?.name || 'Candidate profile'}
        </DialogTitle>
        <DialogContent dividers>
          {profileDialog && (
            <CandidateProfileView
              student={profileDialog.student}
              coverLetter={profileDialog.coverLetter}
              resumeAtApplication={profileDialog.resumeAtApplication}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProfileDialogId(null)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!taskDialog}
        onClose={() => setTaskDialog(null)}
        PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${t.border}` } }}
      >
        <DialogTitle fontWeight={600}>Assign task — {taskDialog?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="date"
            label="Deadline"
            InputLabelProps={{ shrink: true }}
            value={taskForm.deadline}
            onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTaskDialog(null)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateTask}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
