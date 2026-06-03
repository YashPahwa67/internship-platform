import { useEffect, useState, useRef } from 'react';
import {
  TextField, Button, Box, Chip, Alert, Avatar, Typography, Divider, IconButton,
} from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useUploadResumeMutation,
  useDeleteProfilePictureMutation,
  useDeleteResumeMutation,
} from '../../api/studentApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

type FormState = {
  fullName: string;
  phone: string;
  college: string;
  degree: string;
  bio: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  location: string;
  graduationYear: string;
  skills: string[];
  skillInput: string;
};

export default function StudentProfilePage() {
  const { data, refetch } = useGetProfileQuery(undefined);
  const [update, { isLoading, isSuccess, isError: saveError }] = useUpdateProfileMutation();
  const [uploadPicture, { isLoading: uploadingPicture }] = useUploadProfilePictureMutation();
  const [uploadResume, { isLoading: uploadingResume }] = useUploadResumeMutation();
  const [deletePicture] = useDeleteProfilePictureMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const profile = data?.data;
  const [form, setForm] = useState<FormState>({
    fullName: '', phone: '', college: '', degree: '', bio: '',
    linkedIn: '', github: '', portfolio: '', location: '', graduationYear: '',
    skills: [], skillInput: '',
  });
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        college: profile.college || '',
        degree: profile.degree || '',
        bio: profile.bio || '',
        linkedIn: profile.linkedIn || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        location: profile.location || '',
        graduationYear: profile.graduationYear?.toString() || '',
        skills: profile.skills || [],
        skillInput: '',
      });
    }
  }, [profile]);

  const addSkill = () => {
    if (form.skillInput.trim() && !form.skills.includes(form.skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, form.skillInput.trim()], skillInput: '' });
    }
  };

  const handleSave = async () => {
    const { skillInput, graduationYear, ...rest } = form;
    await update({
      ...rest,
      graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
    });
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg(null);
    try {
      await uploadPicture(file).unwrap();
      setUploadMsg({ type: 'success', text: 'Profile picture updated.' });
      refetch();
    } catch {
      setUploadMsg({ type: 'error', text: 'Failed to upload picture. Check file type (JPEG/PNG/WebP) and size (max 2MB).' });
    }
    e.target.value = '';
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg(null);
    try {
      await uploadResume(file).unwrap();
      setUploadMsg({ type: 'success', text: 'Resume uploaded.' });
      refetch();
    } catch {
      setUploadMsg({ type: 'error', text: 'Failed to upload resume. Use PDF or DOC (max 5MB).' });
    }
    e.target.value = '';
  };

  return (
    <Box maxWidth={720}>
      <PageHeader title="Profile" subtitle="Your data is stored securely in MongoDB Atlas. Files are hosted on Cloudinary." />

      {isSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile saved.</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>Failed to save profile.</Alert>}
      {uploadMsg && <Alert severity={uploadMsg.type} sx={{ mb: 2 }} onClose={() => setUploadMsg(null)}>{uploadMsg.text}</Alert>}

      <FadeIn>
        <PremiumCard hover={false} sx={{ mb: 3 }}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Photo & resume</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start', mt: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={profile?.profilePicture?.url}
                  sx={{ width: 96, height: 96, mb: 1, bgcolor: 'action.selected', fontSize: 32 }}
                >
                  {form.fullName?.[0] || '?'}
                </Avatar>
                <input ref={pictureInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePictureChange} />
                <Button
                  size="small"
                  startIcon={<PhotoCameraOutlinedIcon />}
                  onClick={() => pictureInputRef.current?.click()}
                  disabled={uploadingPicture}
                >
                  {uploadingPicture ? 'Uploading...' : 'Change photo'}
                </Button>
                {profile?.profilePicture && (
                  <IconButton size="small" onClick={() => deletePicture(undefined).then(() => refetch())} aria-label="Remove photo">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {profile?.resume ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{profile.resume.filename}</Typography>
                    <Button size="small" href={profile.resume.url} target="_blank" rel="noopener">View</Button>
                    <IconButton size="small" onClick={() => deleteResume(undefined).then(() => refetch())}><DeleteOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>No resume uploaded</Typography>
                )}
                <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx,application/pdf" hidden onChange={handleResumeChange} />
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<UploadFileOutlinedIcon />}
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? 'Uploading...' : profile?.resume ? 'Replace resume' : 'Upload resume'}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  PDF or DOC, max 5MB — stored on Cloudinary
                </Typography>
              </Box>
            </Box>
          </Box>
        </PremiumCard>

        <PremiumCard hover={false}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Personal information</Typography>
            <TextField fullWidth label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} margin="normal" />
            <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} margin="normal" />
            <TextField fullWidth label="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} margin="normal" />
            <TextField fullWidth label="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} margin="normal" />
            <TextField fullWidth label="Graduation year" type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} margin="normal" />
            <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} margin="normal" />

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Links</Typography>
            <TextField fullWidth label="LinkedIn URL" value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} margin="normal" />
            <TextField fullWidth label="GitHub URL" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} margin="normal" />
            <TextField fullWidth label="Portfolio URL" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} margin="normal" />

            <Divider sx={{ my: 3 }} />
            <TextField fullWidth label="Bio" multiline rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} margin="normal" />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Skills</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                label="Add skill"
                value={form.skillInput}
                onChange={(e) => setForm({ ...form, skillInput: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={addSkill} color="inherit">Add</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
              {form.skills.map((s) => (
                <Chip key={s} label={s} onDelete={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })} />
              ))}
            </Box>

            <Button variant="contained" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save profile'}
            </Button>
          </Box>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
