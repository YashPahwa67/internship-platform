import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Button, Divider, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/ui/PageHeader';
import FadeIn from '../../components/ui/FadeIn';
import {
  useListMyMentorshipsQuery,
  useRespondToMentorshipMutation,
  useAddSessionNoteMutation,
  useAddProgressEntryMutation,
} from '../../api/mentorshipApi';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  active: 'success',
  declined: 'error',
  ended: 'default',
};

export default function MentorDashboard() {
  const { data, refetch } = useListMyMentorshipsQuery(undefined);
  const [respond, { isLoading: responding }] = useRespondToMentorshipMutation();
  const [addNote] = useAddSessionNoteMutation();
  const [addProgress] = useAddProgressEntryMutation();

  const mentorships = data?.data || [];
  const pending = mentorships.filter((m: { status: string }) => m.status === 'pending');
  const active = mentorships.filter((m: { status: string }) => m.status === 'active');

  const [noteDialog, setNoteDialog] = useState<{ open: boolean; id: string; type: 'session' | 'progress' }>({ open: false, id: '', type: 'session' });
  const [noteText, setNoteText] = useState('');

  const handleRespond = async (id: string, accept: boolean) => {
    await respond({ id, accept }).unwrap();
    refetch();
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    if (noteDialog.type === 'session') {
      await addNote({ id: noteDialog.id, content: noteText }).unwrap();
    } else {
      await addProgress({ id: noteDialog.id, entry: noteText }).unwrap();
    }
    setNoteText('');
    setNoteDialog({ open: false, id: '', type: 'session' });
    refetch();
  };

  return (
    <Box>
      <PageHeader title="Mentor dashboard" subtitle="Manage your mentees and track their progress." />

      {pending.length > 0 && (
        <FadeIn>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Pending requests</Typography>
          {pending.map((m: { id: string; student: { id: string; name: string; email: string }; status: string }) => (
            <Card key={m.id} variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box>
                  <Typography fontWeight={600}>{m.student.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.student.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small" variant="contained" color="success"
                    startIcon={<CheckCircleOutlineIcon />}
                    disabled={responding}
                    onClick={() => handleRespond(m.id, true)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small" variant="outlined" color="error"
                    startIcon={<CancelOutlinedIcon />}
                    disabled={responding}
                    onClick={() => handleRespond(m.id, false)}
                  >
                    Decline
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
          <Divider sx={{ my: 3 }} />
        </FadeIn>
      )}

      <FadeIn delay={1}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Active mentees ({active.length})</Typography>
        {active.length === 0 && (
          <Typography color="text.secondary">No active mentees yet.</Typography>
        )}
        {active.map((m: {
          id: string;
          student: { id: string; name: string; email: string };
          status: string;
          sessionNotes: { content: string; addedAt: string }[];
          progressLog: { entry: string; addedAt: string }[];
        }) => (
          <Card key={m.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Box>
                  <Typography fontWeight={600}>{m.student.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.student.email}</Typography>
                </Box>
                <Chip label={m.status} size="small" color={statusColor[m.status] || 'default'} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => { setNoteDialog({ open: true, id: m.id, type: 'session' }); setNoteText(''); }}>
                  Session note
                </Button>
                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => { setNoteDialog({ open: true, id: m.id, type: 'progress' }); setNoteText(''); }}>
                  Progress entry
                </Button>
              </Box>

              {m.sessionNotes.length > 0 && (
                <>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">Session notes</Typography>
                  <List dense disablePadding sx={{ mb: 1 }}>
                    {m.sessionNotes.slice(-3).map((n, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText primary={n.content} secondary={new Date(n.addedAt).toLocaleDateString()} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {m.progressLog.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">Progress log</Typography>
                  <List dense disablePadding>
                    {m.progressLog.slice(-3).map((p, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText primary={p.entry} secondary={new Date(p.addedAt).toLocaleDateString()} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </FadeIn>

      <Dialog open={noteDialog.open} onClose={() => setNoteDialog({ ...noteDialog, open: false })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>{noteDialog.type === 'session' ? 'Add session note' : 'Add progress entry'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline rows={4} autoFocus
            label={noteDialog.type === 'session' ? 'Session note' : 'Progress entry'}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" color="inherit" fullWidth onClick={() => setNoteDialog({ ...noteDialog, open: false })}>Cancel</Button>
          <Button variant="contained" fullWidth onClick={handleAddNote} disabled={!noteText.trim()}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
