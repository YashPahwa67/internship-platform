import { useState } from 'react';
import {
  Typography, CardContent, Box, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import { useGetTasksQuery, useSubmitTaskMutation } from '../../api/taskApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const COLUMNS = ['pending', 'submitted', 'approved', 'rejected', 'revision_requested'];

export default function StudentTasksPage() {
  const { data, refetch } = useGetTasksQuery({});
  const [submitTask] = useSubmitTaskMutation();
  const tasks = data?.data || [];
  const [dialog, setDialog] = useState<{ id: string; title: string } | null>(null);
  const [notes, setNotes] = useState('');
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const handleSubmit = async () => {
    if (!dialog) return;
    await submitTask({ id: dialog.id, notes });
    setDialog(null);
    setNotes('');
    refetch();
  };

  return (
    <Box>
      <PageHeader title="Task board" subtitle="View assignments and submit your work." />
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start' }}>
        {COLUMNS.map((status) => (
          <Box key={status} sx={{ minWidth: 280, flex: '0 0 auto' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, textTransform: 'capitalize', color: 'text.secondary' }}>
              {status.replace(/_/g, ' ')} ({tasks.filter((task: { status: string }) => task.status === status).length})
            </Typography>
            {tasks.filter((task: { status: string }) => task.status === status).map((task: {
              id: string; title: string; status: string; deadline?: string; review?: { feedback?: string };
            }) => (
              <PremiumCard key={task.id} hover={false} sx={{ mb: 1.5 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography fontWeight={600} variant="body2">{task.title}</Typography>
                  {task.deadline && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Due {new Date(task.deadline).toLocaleDateString()}
                    </Typography>
                  )}
                  {task.status === 'pending' && (
                    <Button size="small" variant="contained" sx={{ mt: 1.5 }} onClick={() => setDialog({ id: task.id, title: task.title })}>
                      Submit
                    </Button>
                  )}
                  {task.review?.feedback && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {task.review.feedback}
                    </Typography>
                  )}
                </CardContent>
              </PremiumCard>
            ))}
          </Box>
        ))}
      </Box>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${t.border}` } }}>
        <DialogTitle fontWeight={600}>Submit: {dialog?.title}</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={4} label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!notes.trim()}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
