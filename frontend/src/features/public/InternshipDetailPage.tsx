import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container, Typography, Box, Button, CardContent, Chip, Grid, Skeleton, Alert,
  TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select,
  MenuItem, InputLabel, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { Helmet } from 'react-helmet-async';
import { useGetInternshipQuery } from '../../api/internshipApi';
import { useApplyMutation } from '../../api/applicationApi';
import { useGetProfileQuery } from '../../api/studentApi';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { useRef, useState, useEffect } from 'react';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';
import { alpha } from '@mui/material/styles';

interface FormQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'url' | 'number';
  question: string;
  required: boolean;
  options: string[];
}

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetInternshipQuery(id!);
  const [apply, { isLoading: applying }] = useApplyMutation();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isStudent = isAuth && user?.role === 'student';

  const { data: profileData } = useGetProfileQuery(undefined, { skip: !isStudent });
  const profile = profileData?.data;

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});

  const [applicantName, setApplicantName] = useState('');
  const [applicantUniversity, setApplicantUniversity] = useState('');
  const [applicantRollNo, setApplicantRollNo] = useState('');
  const [applicantCgpa, setApplicantCgpa] = useState('');

  useEffect(() => {
    if (!profile) return;
    const name = profile.fullName || [profile.user?.firstName, profile.user?.lastName].filter(Boolean).join(' ');
    if (name) setApplicantName(name);
    if (profile.college) setApplicantUniversity(profile.college);
    if (profile.rollNo) setApplicantRollNo(profile.rollNo);
    if (profile.cgpa != null) setApplicantCgpa(String(profile.cgpa));
  }, [profile]);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { mode } = useThemeMode();
  const t = tokens[mode];
  const location = useLocation();

  const job = data?.data;
  const isSuspended = user?.status === 'suspended';
  const pageUrl = `${window.location.origin}${location.pathname}`;
  const applicationForm: FormQuestion[] = job?.applicationForm || [];

  const handleAnswerChange = (questionId: string, value: string) => {
    setFormAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleApply = async () => {
    if (!isAuth) { navigate('/login'); return; }
    if (user?.role !== 'student') {
      setMessage({ type: 'error', text: 'Only students can apply.' });
      return;
    }
    if (isSuspended) {
      setMessage({ type: 'error', text: 'Your account is suspended. You cannot apply for internships.' });
      return;
    }
    if (!applicantName.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    if (!applicantUniversity.trim()) {
      setMessage({ type: 'error', text: 'University is required.' });
      return;
    }
    if (job?.requireResume && !resumeFile) {
      setMessage({ type: 'error', text: 'A resume is required for this internship. Please attach your resume.' });
      return;
    }
    for (const q of applicationForm) {
      if (q.required && !formAnswers[q.id]?.trim()) {
        setMessage({ type: 'error', text: `"${q.question}" is required.` });
        return;
      }
    }

    try {
      const fd = new FormData();
      fd.append('internshipId', id!);
      if (coverLetter.trim()) fd.append('coverLetter', coverLetter.trim());
      if (resumeFile) fd.append('resume', resumeFile);
      fd.append('applicantName', applicantName.trim());
      fd.append('applicantUniversity', applicantUniversity.trim());
      if (applicantRollNo.trim()) fd.append('applicantRollNo', applicantRollNo.trim());
      if (applicantCgpa.trim()) fd.append('applicantCgpa', applicantCgpa.trim());
      if (applicationForm.length > 0) {
        const responses = applicationForm.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: formAnswers[q.id] || '',
        }));
        fd.append('formResponses', JSON.stringify(responses));
      }
      await apply(fd as Parameters<typeof apply>[0]).unwrap();
      setMessage({ type: 'success', text: 'Application submitted successfully.' });
    } catch (err: unknown) {
      const e = err as {
        data?: {
          message?: string;
          error?: { code?: string; message?: string; details?: { field: string; message: string }[] };
        };
      };
      const code = e?.data?.error?.code;
      if (code === 'ACCOUNT_SUSPENDED') {
        setMessage({ type: 'error', text: 'Your account is suspended. Contact yashpahwa1209@gmail.com for assistance.' });
        return;
      }
      const detail = e?.data?.error?.details?.[0]?.message;
      setMessage({
        type: 'error',
        text: detail || e?.data?.message || e?.data?.error?.message || 'Failed to apply',
      });
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="rounded" height={48} width={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={400} />
      </Container>
    );
  }
  if (!job) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography align="center" color="text.secondary">Internship not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Helmet>
        <title>{job.title} at {job.company?.name} — IMP</title>
        <meta name="description" content={`${job.type} internship · ${job.location} · ₹${job.stipend?.min?.toLocaleString()}–₹${job.stipend?.max?.toLocaleString()}/mo · ${job.durationWeeks} weeks`} />
        <meta property="og:title" content={`${job.title} at ${job.company?.name}`} />
        <meta property="og:description" content={job.description?.slice(0, 200)} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${job.title} at ${job.company?.name}`} />
        <meta name="twitter:description" content={job.description?.slice(0, 200)} />
      </Helmet>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }} color="inherit">
        Back
      </Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <FadeIn>
            <Typography variant="overline" color="text.secondary">{job.company?.name}</Typography>
            <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em" sx={{ mt: 0.5, mb: 2 }}>
              {job.title}
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip label={job.type} size="small" variant="outlined" sx={{ borderColor: t.border }} />
              <Chip label={job.location} size="small" variant="outlined" sx={{ borderColor: t.border }} />
              {job.skills?.map((s: string) => (
                <Chip key={s} label={s} size="small" />
              ))}
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>Description</Typography>
            <Typography paragraph sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.7 }}>
              {job.description}
            </Typography>
            {job.requirements?.length > 0 && (
              <>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>Requirements</Typography>
                <Box component="ul" sx={{ pl: 2.5, color: 'text.secondary', lineHeight: 1.8 }}>
                  {job.requirements.map((r: string) => (
                    <li key={r}><Typography component="span" variant="body2">{r}</Typography></li>
                  ))}
                </Box>
              </>
            )}
          </FadeIn>
        </Grid>
        <Grid item xs={12} md={4}>
          <FadeIn delay={1}>
            <PremiumCard hover={false} glass sx={{ position: { md: 'sticky' }, top: 100 }}>
              <CardContent sx={{ p: 3 }}>
                {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

                {isAuth && user?.role === 'student' && isSuspended && (
                  <Box sx={{
                    mb: 2, p: 1.5, borderRadius: '10px',
                    bgcolor: alpha('#f59e0b', 0.08),
                    border: `1px solid ${alpha('#f59e0b', 0.25)}`,
                    display: 'flex', gap: 1, alignItems: 'flex-start',
                  }}>
                    <BlockIcon sx={{ fontSize: 17, color: '#f59e0b', flexShrink: 0, mt: '1px' }} />
                    <Typography variant="caption" sx={{ color: '#f59e0b', lineHeight: 1.5 }}>
                      Account suspended — you cannot apply for internships.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Stipend</Typography>
                  <Typography fontWeight={600}>
                    ₹{job.stipend?.min?.toLocaleString()} – ₹{job.stipend?.max?.toLocaleString()}/mo
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography fontWeight={500}>{job.durationWeeks} weeks</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">Openings</Typography>
                  <Typography fontWeight={500}>{job.openings}</Typography>
                </Box>

                {isStudent ? (
                  <>
                    {/* Internship role display */}
                    <Box sx={{
                      mb: 2, p: 1.5, borderRadius: '8px',
                      bgcolor: alpha(t.border, 0.4),
                      display: 'flex', alignItems: 'center', gap: 1,
                    }}>
                      <WorkOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                          Applying for
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>{job.title}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                      Your details
                    </Typography>

                    <TextField
                      fullWidth size="small" label="Full name *" value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      disabled={isSuspended} sx={{ mb: 1.5 }}
                    />
                    <TextField
                      fullWidth size="small" label="University *" value={applicantUniversity}
                      onChange={(e) => setApplicantUniversity(e.target.value)}
                      disabled={isSuspended} sx={{ mb: 1.5 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                      <TextField
                        fullWidth size="small" label="Roll No"
                        value={applicantRollNo}
                        onChange={(e) => setApplicantRollNo(e.target.value)}
                        disabled={isSuspended}
                      />
                      <TextField
                        fullWidth size="small" label="CGPA" type="number"
                        inputProps={{ step: 0.01, min: 0, max: 10 }}
                        value={applicantCgpa}
                        onChange={(e) => setApplicantCgpa(e.target.value)}
                        disabled={isSuspended}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Cover letter (optional)</Typography>
                    <Box
                      component="textarea"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      disabled={isSuspended}
                      style={{
                        width: '100%',
                        minHeight: 80,
                        marginBottom: 12,
                        padding: 12,
                        borderRadius: 10,
                        border: `1px solid ${t.border}`,
                        fontFamily: 'inherit',
                        fontSize: 14,
                        background: 'transparent',
                        color: 'inherit',
                        resize: 'vertical',
                        opacity: isSuspended ? 0.45 : 1,
                        cursor: isSuspended ? 'not-allowed' : 'auto',
                      }}
                    />
                    <input
                      ref={resumeRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      hidden
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                    <Button
                      fullWidth
                      variant="outlined"
                      color={job.requireResume && !resumeFile ? 'error' : 'inherit'}
                      size="small"
                      startIcon={<UploadFileOutlinedIcon />}
                      onClick={() => resumeRef.current?.click()}
                      disabled={isSuspended}
                      sx={{ mb: 0.5, justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {resumeFile
                        ? resumeFile.name
                        : job.requireResume
                          ? 'Attach resume (required) *'
                          : 'Attach resume (optional)'}
                    </Button>
                    {job.requireResume && !resumeFile && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1, ml: 0.5 }}>
                        Resume is required for this internship.
                      </Typography>
                    )}
                    {resumeFile && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, ml: 0.5 }}>
                        This will override your profile resume for this application.
                      </Typography>
                    )}

                    {applicationForm.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                          Application questions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {applicationForm.map((q) => (
                            <ApplicationFormField
                              key={q.id}
                              question={q}
                              value={formAnswers[q.id] || ''}
                              onChange={(val) => handleAnswerChange(q.id, val)}
                              disabled={isSuspended}
                            />
                          ))}
                        </Box>
                      </>
                    )}

                    <Button
                      fullWidth variant="contained" size="large"
                      onClick={handleApply}
                      disabled={applying || isSuspended}
                      sx={{ mt: 2 }}
                    >
                      {applying ? 'Applying...' : 'Apply now'}
                    </Button>
                  </>
                ) : (
                  <Button fullWidth variant="contained" size="large" component={RouterLink} to="/login">
                    Sign in to apply
                  </Button>
                )}
              </CardContent>
            </PremiumCard>
          </FadeIn>
        </Grid>
      </Grid>
    </Container>
  );
}

function ApplicationFormField({
  question,
  value,
  onChange,
  disabled,
}: {
  question: FormQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const label = question.required ? `${question.question} *` : question.question;

  if (question.type === 'radio') {
    return (
      <FormControl disabled={disabled}>
        <FormLabel sx={{ fontSize: 13, mb: 0.5 }}>{label}</FormLabel>
        <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
          {question.options.map((opt) => (
            <FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  if (question.type === 'select') {
    return (
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={(e) => onChange(e.target.value)}>
          {question.options.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline={question.type === 'textarea'}
      rows={question.type === 'textarea' ? 3 : undefined}
      type={question.type === 'number' ? 'number' : question.type === 'url' ? 'url' : 'text'}
      disabled={disabled}
    />
  );
}
