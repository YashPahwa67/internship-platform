import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Button, CardContent, Chip, Grid, Skeleton, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetInternshipQuery } from '../../api/internshipApi';
import { useApplyMutation } from '../../api/applicationApi';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { useState } from 'react';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetInternshipQuery(id!);
  const [apply, { isLoading: applying }] = useApplyMutation();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const job = data?.data;

  const handleApply = async () => {
    if (!isAuth) { navigate('/login'); return; }
    if (user?.role !== 'student') {
      setMessage({ type: 'error', text: 'Only students can apply.' });
      return;
    }
    try {
      const body: { internshipId: string; coverLetter?: string } = { internshipId: id! };
      if (coverLetter.trim()) body.coverLetter = coverLetter.trim();
      await apply(body).unwrap();
      setMessage({ type: 'success', text: 'Application submitted successfully.' });
    } catch (err: unknown) {
      const e = err as {
        data?: {
          message?: string;
          error?: { message?: string; details?: { field: string; message: string }[] };
        };
      };
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
                {isAuth && user?.role === 'student' ? (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Cover letter (optional)</Typography>
                    <Box
                      component="textarea"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: 88,
                        marginBottom: 16,
                        padding: 12,
                        borderRadius: 10,
                        border: `1px solid ${t.border}`,
                        fontFamily: 'inherit',
                        fontSize: 14,
                        background: 'transparent',
                        color: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                    <Button fullWidth variant="contained" size="large" onClick={handleApply} disabled={applying}>
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
