import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Box, MenuItem, Alert, CircularProgress, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { alpha } from '@mui/material/styles';
import {
  useCreateInternshipMutation,
  useUpdateInternshipMutation,
  useGetCompanyInternshipQuery,
} from '../../api/internshipApi';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/auth/authSlice';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

const emptyForm = {
  title: '',
  description: '',
  skills: '',
  type: 'remote',
  location: 'Remote',
  durationWeeks: 12,
  openings: 1,
  stipendMin: 15000,
  stipendMax: 25000,
};

export default function PostInternshipPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isSuspended = user?.status === 'suspended';

  const { data: existing, isLoading: loadingExisting } = useGetCompanyInternshipQuery(id!, {
    skip: !isEdit,
  });
  const [create, { isLoading: creating }] = useCreateInternshipMutation();
  const [update, { isLoading: updating }] = useUpdateInternshipMutation();
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const job = existing?.data;
    if (!job) return;
    setForm({
      title: job.title || '',
      description: job.description || '',
      skills: (job.skills || []).join(', '),
      type: job.type || 'remote',
      location: job.location || 'Remote',
      durationWeeks: job.durationWeeks ?? 12,
      openings: job.openings ?? 1,
      stipendMin: job.stipend?.min ?? 15000,
      stipendMax: job.stipend?.max ?? 25000,
    });
  }, [existing]);

  const buildPayload = (submit: boolean) => ({
    title: form.title,
    description: form.description,
    skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    type: form.type,
    location: form.location,
    durationWeeks: form.durationWeeks,
    openings: form.openings,
    stipend: { min: form.stipendMin, max: form.stipendMax, currency: 'INR' },
    submit,
  });

  const handleSubmit = async (e: React.FormEvent, submit: boolean) => {
    e.preventDefault();
    setError('');
    if (isSuspended) {
      setError('Your account is suspended. You cannot post or edit internships.');
      return;
    }
    try {
      if (isEdit && id) {
        await update({ id, ...buildPayload(submit) }).unwrap();
      } else {
        await create(buildPayload(submit)).unwrap();
      }
      navigate('/company/internships');
    } catch (err: unknown) {
      const e = err as { data?: { message?: string; error?: { code?: string; message?: string } } };
      const code = e?.data?.error?.code;
      if (code === 'ACCOUNT_SUSPENDED') {
        setError('Your account is suspended. Contact yashpahwa1209@gmail.com for assistance.');
        return;
      }
      setError(e?.data?.message || e?.data?.error?.message || 'Failed to save');
    }
  };

  const isLoading = creating || updating;

  if (isEdit && loadingExisting) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={720}>
      <PageHeader
        title={isEdit ? 'Edit internship' : 'Post internship'}
        subtitle={
          isEdit
            ? 'Update your listing. Use Publish to make it visible to students.'
            : 'Publish a listing — students will see it immediately after you submit.'
        }
      />
      <FadeIn>
        {isSuspended && (
          <Box sx={{
            mb: 3, p: 2, borderRadius: '12px',
            bgcolor: alpha('#f59e0b', 0.08),
            border: `1px solid ${alpha('#f59e0b', 0.25)}`,
            display: 'flex', gap: 1.5, alignItems: 'flex-start',
          }}>
            <BlockIcon sx={{ fontSize: 20, color: '#f59e0b', flexShrink: 0, mt: '1px' }} />
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#f59e0b', mb: 0.25 }}>
                Account suspended
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your account is suspended. You cannot post or edit internships until your account is restored by an admin.
              </Typography>
            </Box>
          </Box>
        )}
        <PremiumCard hover={false}>
          <Box component="form" sx={{ p: { xs: 3, md: 4 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              margin="normal"
              required
              disabled={isSuspended}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              margin="normal"
              required
              disabled={isSuspended}
            />
            <TextField
              fullWidth
              label="Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              margin="normal"
              disabled={isSuspended}
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              margin="normal"
              disabled={isSuspended}
            >
              {['remote', 'hybrid', 'onsite'].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              margin="normal"
              disabled={isSuspended}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                type="number"
                label="Stipend min"
                value={form.stipendMin}
                onChange={(e) => setForm({ ...form, stipendMin: +e.target.value })}
                margin="normal"
                sx={{ flex: 1, minWidth: 120 }}
                disabled={isSuspended}
              />
              <TextField
                type="number"
                label="Stipend max"
                value={form.stipendMax}
                onChange={(e) => setForm({ ...form, stipendMax: +e.target.value })}
                margin="normal"
                sx={{ flex: 1, minWidth: 120 }}
                disabled={isSuspended}
              />
              <TextField
                type="number"
                label="Weeks"
                value={form.durationWeeks}
                onChange={(e) => setForm({ ...form, durationWeeks: +e.target.value })}
                margin="normal"
                sx={{ width: 100 }}
                disabled={isSuspended}
              />
              <TextField
                type="number"
                label="Openings"
                value={form.openings}
                onChange={(e) => setForm({ ...form, openings: +e.target.value })}
                margin="normal"
                sx={{ width: 100 }}
                disabled={isSuspended}
              />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/company/internships')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isLoading || isSuspended}
              >
                Save draft
              </Button>
              <Button
                variant="contained"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isLoading || isSuspended}
              >
                {isLoading ? 'Saving...' : isEdit ? 'Publish changes' : 'Publish listing'}
              </Button>
            </Box>
          </Box>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
