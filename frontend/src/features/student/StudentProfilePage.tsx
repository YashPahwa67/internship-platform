import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField, Button, Box, Chip, Alert, Avatar, Typography, Divider, IconButton, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Autocomplete,
} from '@mui/material';
import { SKILLS_LIST, isKnownSkill } from '../../data/skills';
import ProfileCompleteness from '../../components/ui/ProfileCompleteness';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useUploadResumeMutation,
  useDeleteProfilePictureMutation,
  useDeleteResumeMutation,
} from '../../api/studentApi';
import { useDeleteAccountMutation, useRequestEmailChangeMutation, useConfirmEmailChangeMutation, useChangePasswordMutation } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { logout, patchUser, selectUser } from '../auth/authSlice';
import { useAppSelector } from '../../app/hooks';
import { syncProfileToAuth } from '../../utils/syncProfileToAuth';
import { baseApi } from '../../api/baseApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

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
  rollNo: string;
  cgpa: string;
  skills: string[];
  skillInput: string;
};

export default function StudentProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const t = tokens[mode];
  const { data, refetch } = useGetProfileQuery(undefined);
  const [update, { isLoading, isSuccess, isError: saveError }] = useUpdateProfileMutation();
  const [uploadPicture, { isLoading: uploadingPicture }] = useUploadProfilePictureMutation();
  const [uploadResume, { isLoading: uploadingResume }] = useUploadResumeMutation();
  const [deletePicture] = useDeleteProfilePictureMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const [changePasswordApi, { isLoading: changingPwd }] = useChangePasswordMutation();
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAppSelector(selectUser);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Email change state
  const [requestEmailChange, { isLoading: requesting }] = useRequestEmailChangeMutation();
  const [confirmEmailChange, { isLoading: confirming }] = useConfirmEmailChangeMutation();
  const [emailDialogStep, setEmailDialogStep] = useState<'closed' | 'input' | 'otp'>('closed');
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpDigits, setEmailOtpDigits] = useState<string[]>(Array(6).fill(''));
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState('');

  const profile = data?.data;
  const [form, setForm] = useState<FormState>({
    fullName: '', phone: '', college: '', degree: '', bio: '',
    linkedIn: '', github: '', portfolio: '', location: '', graduationYear: '',
    rollNo: '', cgpa: '',
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
        rollNo: profile.rollNo || '',
        cgpa: profile.cgpa != null ? String(profile.cgpa) : '',
        skills: profile.skills || [],
        skillInput: '',
      });
      syncProfileToAuth(dispatch, profile);
    }
  }, [profile, dispatch]);

  const handleSave = async () => {
    const { skillInput, graduationYear, cgpa, rollNo, ...rest } = form;
    try {
      const res = await update({
        ...rest,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        rollNo: rollNo.trim() || undefined,
        cgpa: cgpa.trim() ? parseFloat(cgpa) : undefined,
      }).unwrap();
      syncProfileToAuth(dispatch, res.data);
      setUploadMsg({ type: 'success', text: 'Profile saved.' });
    } catch {
      setUploadMsg({ type: 'error', text: 'Failed to save profile.' });
    }
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg(null);
    try {
      const res = await uploadPicture(file).unwrap();
      syncProfileToAuth(dispatch, res.data);
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
      const res = await uploadResume(file).unwrap();
      syncProfileToAuth(dispatch, res.data);
      setUploadMsg({ type: 'success', text: 'Resume uploaded.' });
      refetch();
    } catch {
      setUploadMsg({ type: 'error', text: 'Failed to upload resume. Use PDF or DOC (max 5MB).' });
    }
    e.target.value = '';
  };

  const handleDeletePicture = async () => {
    const res = await deletePicture().unwrap();
    syncProfileToAuth(dispatch, res.data);
    refetch();
  };

  const handleDeleteResume = async () => {
    await deleteResume().unwrap();
    refetch();
  };

  const openPwdDialog = () => {
    setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPwdError('');
    setPwdSuccess(false);
    setPwdDialogOpen(true);
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New passwords do not match'); return;
    }
    try {
      await changePasswordApi({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }).unwrap();
      setPwdSuccess(true);
      setTimeout(() => setPwdDialogOpen(false), 1500);
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setPwdError(e?.data?.error?.message || 'Failed to update password');
    }
  };

  const handleRequestEmailChange = async () => {
    setEmailChangeError('');
    try {
      await requestEmailChange({ newEmail }).unwrap();
      setEmailOtpDigits(Array(6).fill(''));
      setEmailDialogStep('otp');
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setEmailChangeError(e?.data?.error?.message || 'Failed to send code');
    }
  };

  const handleEmailOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...emailOtpDigits];
    next[index] = digit;
    setEmailOtpDigits(next);
    setEmailChangeError('');
    if (digit && index < 5) emailOtpRefs.current[index + 1]?.focus();
    if (next.every(Boolean)) handleConfirmEmailChange(next.join(''));
  };

  const handleEmailOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (emailOtpDigits[index]) {
        const next = [...emailOtpDigits]; next[index] = ''; setEmailOtpDigits(next);
      } else emailOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmEmailChange = async (otp: string) => {
    if (otp.length !== 6) return;
    setEmailChangeError('');
    try {
      const res = await confirmEmailChange({ otp }).unwrap();
      dispatch(patchUser({ email: res.data.user.email }));
      setEmailChangeSuccess(`Email updated to ${res.data.user.email}`);
      setEmailDialogStep('closed');
      setNewEmail('');
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setEmailChangeError(e?.data?.error?.message || 'Invalid code');
      setEmailOtpDigits(Array(6).fill(''));
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 50);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleteError('');
    try {
      await deleteAccount(undefined).unwrap();
      dispatch(logout());
      baseApi.util.resetApiState();
      navigate('/login');
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  return (
    <Box maxWidth={720}>
      <PageHeader title="Profile" />

      {isSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile saved.</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>Failed to save profile.</Alert>}
      {uploadMsg && <Alert severity={uploadMsg.type} sx={{ mb: 2 }} onClose={() => setUploadMsg(null)}>{uploadMsg.text}</Alert>}

      {profile && (
        <FadeIn>
          <PremiumCard hover={false} sx={{ mb: 3 }}>
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <ProfileCompleteness profile={profile} />
            </Box>
          </PremiumCard>
        </FadeIn>
      )}

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
                  <IconButton size="small" onClick={handleDeletePicture} aria-label="Remove photo">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {profile?.resume ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{profile.resume.filename}</Typography>
                    <Button size="small" href={profile.resume.url} target="_blank" rel="noopener">View</Button>
                    <IconButton size="small" onClick={handleDeleteResume}><DeleteOutlineIcon fontSize="small" /></IconButton>
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
                  PDF or DOC, max 5MB
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Roll No" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} margin="normal" />
              <TextField fullWidth label="CGPA" type="number" inputProps={{ step: 0.01, min: 0, max: 10 }} value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} margin="normal" />
            </Box>
            <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} margin="normal" />

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Links</Typography>
            <TextField fullWidth label="LinkedIn URL" value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} margin="normal" />
            <TextField fullWidth label="GitHub URL" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} margin="normal" />
            <TextField fullWidth label="Portfolio URL" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} margin="normal" />

            <Divider sx={{ my: 3 }} />
            <TextField fullWidth label="Bio" multiline rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} margin="normal" />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Skills</Typography>
            <Autocomplete
              freeSolo
              options={SKILLS_LIST.filter((s) => !form.skills.includes(s))}
              inputValue={form.skillInput}
              onInputChange={(_, val) => setForm({ ...form, skillInput: val })}
              onChange={(_, val) => {
                if (!val) return;
                let trimmed = typeof val === 'string' ? val.trim() : val as string;
                // Strip the 'Add "..."' wrapper injected by filterOptions
                const addMatch = trimmed.match(/^Add "(.+)"$/);
                if (addMatch) trimmed = addMatch[1];
                if (trimmed && !form.skills.includes(trimmed)) {
                  setForm({ ...form, skills: [...form.skills, trimmed], skillInput: '' });
                }
              }}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.toLowerCase();
                if (!q) return options.slice(0, 50);
                const filtered = options.filter((o) => o.toLowerCase().includes(q)).slice(0, 40);
                const exactMatch = filtered.some((o) => o.toLowerCase() === q);
                if (!exactMatch && inputValue.trim() && !form.skills.includes(inputValue.trim())) {
                  filtered.push(`Add "${inputValue.trim()}"`);
                }
                return filtered;
              }}
              renderOption={(props, option) => {
                const isCustom = option.startsWith('Add "');
                return (
                  <li {...props} key={option}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>{isCustom ? option : option}</Typography>
                      {!isCustom && !isKnownSkill(option) && (
                        <Chip label="custom" size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                      )}
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Search or add skill"
                  placeholder="e.g. React, Python, Figma…"
                  helperText="Select from the list or type your own and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && form.skillInput.trim()) {
                      e.preventDefault();
                      const trimmed = form.skillInput.trim();
                      if (!form.skills.includes(trimmed)) {
                        setForm({ ...form, skills: [...form.skills, trimmed], skillInput: '' });
                      }
                    }
                  }}
                />
              )}
              sx={{ mb: 1.5 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
              {form.skills.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  variant={isKnownSkill(s) ? 'filled' : 'outlined'}
                  onDelete={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })}
                />
              ))}
            </Box>

            <Button variant="contained" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save profile'}
            </Button>
          </Box>
        </PremiumCard>

        {/* Email change */}
        {emailChangeSuccess && (
          <Alert severity="success" sx={{ mt: 3 }} onClose={() => setEmailChangeSuccess('')}>
            {emailChangeSuccess}
          </Alert>
        )}
        <PremiumCard hover={false} sx={{ mt: 3 }}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Email address</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current: <Box component="span" fontWeight={600} color="text.primary">{currentUser?.email}</Box>
            </Typography>
            <Button variant="outlined" color="inherit" size="small" onClick={() => { setEmailDialogStep('input'); setEmailChangeError(''); setNewEmail(''); }}>
              Change email
            </Button>
          </Box>
        </PremiumCard>

        {/* Change password — button only */}
        <PremiumCard hover={false} sx={{ mt: 3 }}>
          <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Password</Typography>
              <Typography variant="body2" color="text.secondary">Update your account password</Typography>
            </Box>
            <Button variant="outlined" color="inherit" startIcon={<LockOutlinedIcon />} onClick={openPwdDialog}>
              Change password
            </Button>
          </Box>
        </PremiumCard>

        {/* Danger zone */}
        <PremiumCard hover={false} sx={{ mt: 3, border: `1px solid`, borderColor: 'error.main', borderRadius: 2 }}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WarningAmberIcon color="error" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="error.main">
                Danger zone
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Permanently delete your account and all associated data — profile, applications, and uploaded files. This action cannot be undone.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => { setConfirmText(''); setDeleteError(''); setDeleteDialogOpen(true); }}
            >
              Delete my account
            </Button>
          </Box>
        </PremiumCard>
      </FadeIn>

      {/* Change password dialog */}
      <Dialog
        open={pwdDialogOpen}
        onClose={() => !changingPwd && setPwdDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>Change password</DialogTitle>
        <DialogContent>
          {pwdSuccess ? (
            <Alert severity="success">Password updated!</Alert>
          ) : (
            <>
              <TextField
                fullWidth type="password" label="Current password"
                value={pwdForm.oldPassword}
                onChange={(e) => { setPwdForm({ ...pwdForm, oldPassword: e.target.value }); setPwdError(''); }}
                margin="normal" autoComplete="current-password" autoFocus
              />
              <TextField
                fullWidth type="password" label="New password"
                value={pwdForm.newPassword}
                onChange={(e) => { setPwdForm({ ...pwdForm, newPassword: e.target.value }); setPwdError(''); }}
                margin="normal" helperText="Min 8 chars with upper, lower, and digit"
                autoComplete="new-password"
              />
              <TextField
                fullWidth type="password" label="Confirm new password"
                value={pwdForm.confirmPassword}
                onChange={(e) => { setPwdForm({ ...pwdForm, confirmPassword: e.target.value }); setPwdError(''); }}
                margin="normal" autoComplete="new-password"
              />
              {pwdError && <Alert severity="error" sx={{ mt: 1.5 }}>{pwdError}</Alert>}
              <Box sx={{ mt: 1.5 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2" color="text.secondary"
                  onClick={() => setPwdDialogOpen(false)}>
                  Forgot password?
                </Link>
              </Box>
            </>
          )}
        </DialogContent>
        {!pwdSuccess && (
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button variant="outlined" color="inherit" fullWidth onClick={() => setPwdDialogOpen(false)} disabled={changingPwd}>
              Cancel
            </Button>
            <Button
              variant="contained" fullWidth onClick={handleChangePassword}
              disabled={!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword || changingPwd}
              startIcon={changingPwd ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {changingPwd ? 'Updating…' : 'Update'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Email change dialog */}
      <Dialog
        open={emailDialogStep !== 'closed'}
        onClose={() => !requesting && !confirming && setEmailDialogStep('closed')}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {emailDialogStep === 'input' && (
          <>
            <DialogTitle sx={{ pb: 1 }}>Change email address</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your new email. We'll send a verification code to confirm.
              </Typography>
              <TextField
                fullWidth
                type="email"
                label="New email address"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailChangeError(''); }}
                disabled={requesting}
                autoFocus
              />
              {emailChangeError && <Alert severity="error" sx={{ mt: 2 }}>{emailChangeError}</Alert>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button variant="outlined" color="inherit" onClick={() => setEmailDialogStep('closed')} disabled={requesting} fullWidth>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleRequestEmailChange}
                disabled={!newEmail || requesting}
                startIcon={requesting ? <CircularProgress size={16} color="inherit" /> : null}
                fullWidth
              >
                {requesting ? 'Sending…' : 'Send code'}
              </Button>
            </DialogActions>
          </>
        )}

        {emailDialogStep === 'otp' && (
          <>
            <DialogTitle sx={{ pb: 1 }}>Enter verification code</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We sent a 6-digit code to <Box component="span" fontWeight={600} color="text.primary">{newEmail}</Box>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 1 }}>
                {emailOtpDigits.map((d, i) => (
                  <Box
                    key={i}
                    component="input"
                    ref={(el: HTMLInputElement | null) => { emailOtpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmailOtpChange(i, e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleEmailOtpKeyDown(i, e)}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                    sx={{
                      width: 44, height: 52, textAlign: 'center',
                      fontSize: '1.4rem', fontWeight: 700, fontFamily: 'monospace',
                      border: '2px solid', borderColor: emailChangeError ? 'error.main' : d ? 'primary.main' : t.border,
                      borderRadius: 1.5, outline: 'none', bgcolor: 'transparent', color: 'text.primary',
                      caretColor: 'transparent', cursor: 'pointer',
                      '&:focus': { borderColor: emailChangeError ? 'error.main' : 'primary.main' },
                    }}
                  />
                ))}
              </Box>
              {emailChangeError && <Alert severity="error" sx={{ mt: 2 }}>{emailChangeError}</Alert>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button variant="outlined" color="inherit" onClick={() => setEmailDialogStep('input')} disabled={confirming} fullWidth>Back</Button>
              <Button
                variant="contained"
                onClick={() => handleConfirmEmailChange(emailOtpDigits.join(''))}
                disabled={emailOtpDigits.some(d => !d) || confirming}
                startIcon={confirming ? <CircularProgress size={16} color="inherit" /> : null}
                fullWidth
              >
                {confirming ? 'Confirming…' : 'Confirm'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon color="error" />
            <Typography variant="h6" fontWeight={700}>Delete account?</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            This will permanently delete your account, student profile, all applications, and uploaded files. There is no way to recover this data.
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Type <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: t.bgMuted, px: 0.75, py: 0.25, borderRadius: 1 }}>DELETE</Box> to confirm
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            autoComplete="off"
            sx={{ '& input': { fontFamily: 'monospace', letterSpacing: 1 } }}
          />
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={confirmText !== 'DELETE' || deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            fullWidth
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
