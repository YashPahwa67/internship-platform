import { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, List, ListItem, ListItemText, Divider, Alert, CircularProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../../components/ui/PageHeader';
import FadeIn from '../../components/ui/FadeIn';
import {
  useListMentorsQuery,
  useRequestMentorshipMutation,
  useListMyMentorshipsQuery,
  useAddSessionNoteMutation,
  useAddProgressEntryMutation,
} from '../../api/mentorshipApi';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  active: 'success',
  declined: 'error',
  ended: 'default',
};

export default function StudentMentorshipPage() {
  const { data: mentorsData } = useListMentorsQuery(undefined);
  const { data: myData, refetch } = useListMyMentorshipsQuery(undefined);
  const [requestMentorship, { isLoading: requesting }] = useRequestMentorshipMutation();
  const [addNote] = useAddSessionNoteMutation();
  const [addProgress] = useAddProgressEntryMutation();

  const mentors = mentorsData?.data || [];
  const myMentorships = myData?.data || [];

  const [requestDialog, setRequestDialog] = useState<{ open: boolean; mentorId: string; mentorName: string }>({ open: false, mentorId: '', mentorName: '' });
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; id: string; type: 'session' | 'progress' }>({ open: false, id: '', type: 'session' });
  const [noteText, setNoteText] = useState('');
  const [requestError, setRequestError] = useState('');

  const handleRequest = async () => {
    setRequestError('');
    try {
      await requestMentorship({ mentorId: requestDialog.mentorId }).unwrap();
      setRequestDialog({ open: false, mentorId: '', mentorName: '' });
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setRequestError(e?.data?.message || 'Failed to send request');
    }
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
      <PageHeader title="Mentorship" subtitle="Connect with a mentor to guide your internship journey." />

      {myMentorships.length > 0 && (
        <FadeIn>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>My mentorships</Typography>
          {myMentorships.map((m: {
            id: string;
            status: string;
            mentor: { id: string; name: string; email: string };
            sessionNotes: { content: string; addedAt: string }[];
            progressLog: { entry: string; addedAt: string }[];
          }) => (
            <Card key={m.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography fontWeight={600}>{m.mentor.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{m.mentor.email}</Typography>
                  </Box>
                  <Chip label={m.status} size="small" color={statusColor[m.status] || 'default'} />
                </Box>

                {m.status === 'active' && (
                  <Box sx={{ mt: 2 }}>
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
                          {m.sessionNotes.map((n, i) => (
                            <ListItem key={i} disablePadding>
                              <ListItemText
                                primary={n.content}
                                secondary={new Date(n.addedAt).toLocaleDateString()}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
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
                          {m.progressLog.map((p, i) => (
                            <ListItem key={i} disablePadding>
                              <ListItemText
                                primary={p.entry}
                                secondary={new Date(p.addedAt).toLocaleDateString()}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
          <Divider sx={{ my: 3 }} />
        </FadeIn>
      )}

      <FadeIn delay={1}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Available mentors</Typography>
        {mentors.length === 0 && (
          <Typography color="text.secondary">No mentors available at the moment.</Typography>
        )}
        {mentors.map((mentor: { id: string; name: string; email: string }, i: number) => {
          const alreadyLinked = myMentorships.some((m: { mentor: { id: string }; status: string }) =>
            m.mentor.id === mentor.id && ['pending', 'active'].includes(m.status)
          );
          return (
            <FadeIn key={mentor.id} delay={(i % 3) as 0 | 1 | 2}>
              <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonOutlineIcon color="action" />
                    <Box>
                      <Typography fontWeight={600}>{mentor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{mentor.email}</Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant={alreadyLinked ? 'outlined' : 'contained'}
                    disabled={alreadyLinked}
                    onClick={() => setRequestDialog({ open: true, mentorId: mentor.id, mentorName: mentor.name })}
                  >
                    {alreadyLinked ? 'Requested' : 'Request'}
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </FadeIn>

      {/* Request dialog */}
      <Dialog open={requestDialog.open} onClose={() => setRequestDialog({ open: false, mentorId: '', mentorName: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Request mentorship</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Send a mentorship request to <strong>{requestDialog.mentorName}</strong>. They will review and accept or decline.
          </Typography>
          {requestError && <Alert severity="error" sx={{ mt: 2 }}>{requestError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" color="inherit" fullWidth onClick={() => setRequestDialog({ open: false, mentorId: '', mentorName: '' })}>Cancel</Button>
          <Button variant="contained" fullWidth onClick={handleRequest} disabled={requesting}
            startIcon={requesting ? <CircularProgress size={16} color="inherit" /> : null}>
            {requesting ? 'Sending…' : 'Send request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note/progress dialog */}
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
