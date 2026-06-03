import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, MenuItem, Alert } from '@mui/material';
import { useCreateInternshipMutation } from '../../api/internshipApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function PostInternshipPage() {
  const navigate = useNavigate();
  const [create, { isLoading }] = useCreateInternshipMutation();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', skills: '', type: 'remote', location: 'Remote',
    durationWeeks: 12, openings: 1, stipendMin: 15000, stipendMax: 25000,
  });

  const handleSubmit = async (e: React.FormEvent, submit: boolean) => {
    e.preventDefault();
    setError('');
    try {
      await create({
        title: form.title,
        description: form.description,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        type: form.type,
        location: form.location,
        durationWeeks: form.durationWeeks,
        openings: form.openings,
        stipend: { min: form.stipendMin, max: form.stipendMax, currency: 'INR' },
        submit,
      }).unwrap();
      navigate('/company/internships');
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setError(e?.data?.error?.message || 'Failed to create');
    }
  };

  return (
    <Box maxWidth={720}>
      <PageHeader title="Post internship" subtitle="Create a new listing and submit for admin review." />
      <FadeIn>
        <PremiumCard hover={false}>
          <Box component="form" sx={{ p: { xs: 3, md: 4 } }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} margin="normal" required />
            <TextField fullWidth label="Description" multiline rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} margin="normal" required />
            <TextField fullWidth label="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} margin="normal" />
            <TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} margin="normal">
              {['remote', 'hybrid', 'onsite'].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} margin="normal" />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField type="number" label="Stipend min" value={form.stipendMin} onChange={(e) => setForm({ ...form, stipendMin: +e.target.value })} margin="normal" sx={{ flex: 1, minWidth: 120 }} />
              <TextField type="number" label="Stipend max" value={form.stipendMax} onChange={(e) => setForm({ ...form, stipendMax: +e.target.value })} margin="normal" sx={{ flex: 1, minWidth: 120 }} />
              <TextField type="number" label="Weeks" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: +e.target.value })} margin="normal" sx={{ width: 100 }} />
              <TextField type="number" label="Openings" value={form.openings} onChange={(e) => setForm({ ...form, openings: +e.target.value })} margin="normal" sx={{ width: 100 }} />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="outlined" color="inherit" onClick={(e) => handleSubmit(e, false)} disabled={isLoading}>Save draft</Button>
              <Button variant="contained" onClick={(e) => handleSubmit(e, true)} disabled={isLoading}>Submit for review</Button>
            </Box>
          </Box>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
