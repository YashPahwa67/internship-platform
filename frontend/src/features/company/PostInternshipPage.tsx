import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField, Button, Box, MenuItem, Alert, CircularProgress, Typography,
  Switch, FormControlLabel, Divider, IconButton, Chip, Tooltip,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import { alpha } from '@mui/material/styles';
import {
  useCreateInternshipMutation,
  useUpdateInternshipMutation,
  useGetCompanyInternshipQuery,
  useSaveApplicationFormMutation,
} from '../../api/internshipApi';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/auth/authSlice';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

const QUESTION_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'url', label: 'URL / Link' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple choice' },
];

interface AppQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'url' | 'number';
  question: string;
  required: boolean;
  options: string[];
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

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
  const [saveForm] = useSaveApplicationFormMutation();

  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const [requireResume, setRequireResume] = useState(false);
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

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
    setRequireResume(job.requireResume ?? false);
    setQuestions(
      (job.applicationForm || []).map((q: AppQuestion) => ({
        id: q.id || makeId(),
        type: q.type || 'text',
        question: q.question || '',
        required: q.required ?? false,
        options: q.options || [],
      }))
    );
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
      let internshipId = id;
      if (isEdit && id) {
        await update({ id, ...buildPayload(submit) }).unwrap();
      } else {
        const result = await create(buildPayload(submit)).unwrap();
        internshipId = result?.data?.id;
      }

      if (internshipId) {
        await saveForm({
          id: internshipId,
          requireResume,
          questions: questions.map((q) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            required: q.required,
            options: q.options,
          })),
        }).unwrap();
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

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions((prev) => [
      ...prev,
      { id: makeId(), type: 'text', question: '', required: false, options: [] },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, patch: Partial<AppQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const addOption = (idx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, options: [...q.options, ''] } : q))
    );
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? val : o)) } : q
      )
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q
      )
    );
  };

  const formLink = id ? `${window.location.origin}/internships/${id}` : null;

  const handleCopyLink = () => {
    if (!formLink) return;
    navigator.clipboard.writeText(formLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
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

            <Divider sx={{ my: 3 }} />

            {/* Application form builder */}
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={600}>Application form</Typography>
              {formLink && (
                <Tooltip title={copySuccess ? 'Copied!' : 'Copy shareable form link'} placement="left">
                  <Button
                    size="small"
                    startIcon={<LinkIcon />}
                    endIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                    onClick={handleCopyLink}
                    color={copySuccess ? 'success' : 'inherit'}
                    variant="outlined"
                    sx={{ textTransform: 'none', fontSize: 12 }}
                  >
                    {copySuccess ? 'Copied!' : 'Share form link'}
                  </Button>
                </Tooltip>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Students will fill these out when applying. Share the internship link so candidates can apply directly.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={requireResume}
                  onChange={(e) => setRequireResume(e.target.checked)}
                  disabled={isSuspended}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>Require resume</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students must attach a resume to apply
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start', ml: 0 }}
            />

            {questions.map((q, idx) => (
              <Box
                key={q.id}
                sx={{
                  mb: 2, p: 2, borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    select
                    label="Type"
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, { type: e.target.value as AppQuestion['type'], options: [] })}
                    disabled={isSuspended}
                    sx={{ width: 150 }}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    fullWidth
                    label={`Question ${idx + 1}`}
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                    disabled={isSuspended}
                    placeholder="e.g. Why do you want this internship?"
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeQuestion(idx)}
                    disabled={isSuspended}
                    sx={{ mt: 0.5, color: 'text.secondary' }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={q.required}
                        onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                        disabled={isSuspended}
                      />
                    }
                    label={<Typography variant="caption">Required</Typography>}
                    sx={{ mr: 0 }}
                  />
                  {(q.type === 'select' || q.type === 'radio') && (
                    <Chip
                      label={`${q.options.length} options`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11 }}
                    />
                  )}
                </Box>
                {(q.type === 'select' || q.type === 'radio') && (
                  <Box sx={{ mt: 1.5, pl: 1 }}>
                    {q.options.map((opt, oIdx) => (
                      <Box key={oIdx} sx={{ display: 'flex', gap: 1, mb: 0.75, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                          disabled={isSuspended}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeOption(idx, oIdx)}
                          disabled={isSuspended}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addOption(idx)}
                      disabled={isSuspended || q.options.length >= 10}
                      sx={{ textTransform: 'none', mt: 0.5 }}
                    >
                      Add option
                    </Button>
                  </Box>
                )}
              </Box>
            ))}

            {questions.length < 20 && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                disabled={isSuspended}
                sx={{ textTransform: 'none', mb: 3 }}
                size="small"
              >
                Add question
              </Button>
            )}

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                onClick={(e: React.MouseEvent) => handleSubmit(e, false)}
                disabled={isLoading || isSuspended}
              >
                Save draft
              </Button>
              <Button
                variant="contained"
                onClick={(e: React.MouseEvent) => handleSubmit(e, true)}
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
