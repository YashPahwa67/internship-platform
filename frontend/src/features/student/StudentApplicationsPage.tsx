import { useState } from 'react';
import {
  Typography, CardContent, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Rating,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { useGetApplicationsQuery, useWithdrawApplicationMutation, useSubmitStudentReviewMutation } from '../../api/applicationApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';
import { baseApi } from '../../api/baseApi';
import { useAppSelector } from '../../app/hooks';
import { selectAccessToken } from '../auth/authSlice';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function StudentApplicationsPage() {
  const { data, refetch } = useGetApplicationsQuery({});
  const [withdraw] = useWithdrawApplicationMutation();
  const [submitReview, { isLoading: submittingReview }] = useSubmitStudentReviewMutation();
  const token = useAppSelector(selectAccessToken);
  const applications = data?.data || [];

  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; id: string; companyName: string }>({ open: false, id: '', companyName: '' });
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleWithdraw = async (id: string) => {
    await withdraw(id);
    refetch();
  };

  const handleDownloadCertificate = async (id: string) => {
    setDownloading(id);
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/certificate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent — could add a snackbar */
    } finally {
      setDownloading(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) return;
    setReviewError('');
    try {
      await submitReview({ id: reviewDialog.id, rating, comment }).unwrap();
      setReviewSuccess('Review submitted — thank you!');
      baseApi.util.invalidateTags(['Applications']);
      setTimeout(() => {
        setReviewDialog({ open: false, id: '', companyName: '' });
        setReviewSuccess('');
        setRating(null);
        setComment('');
      }, 1500);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setReviewError(e?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <Box>
      <PageHeader title="My applications" subtitle="Track status and manage your active applications." />
      {applications.map((a: {
        id: string;
        status: string;
        appliedAt: string;
        internship?: { title: string };
        studentReview?: { rating: number };
      }, i: number) => (
        <FadeIn key={a.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 3 }}>
              <Box>
                <Typography fontWeight={600}>{a.internship?.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Applied {new Date(a.appliedAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <StatusChip status={a.status} />
                {['applied', 'shortlisted'].includes(a.status) && (
                  <Button size="small" variant="outlined" color="inherit" onClick={() => handleWithdraw(a.id)}>
                    Withdraw
                  </Button>
                )}
                {a.status === 'completed' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<DownloadIcon />}
                    disabled={downloading === a.id}
                    onClick={() => handleDownloadCertificate(a.id)}
                  >
                    {downloading === a.id ? 'Downloading…' : 'Certificate'}
                  </Button>
                )}
                {a.status === 'completed' && !a.studentReview?.rating && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<StarOutlineIcon />}
                    onClick={() => {
                      setRating(null);
                      setComment('');
                      setReviewError('');
                      setReviewSuccess('');
                      setReviewDialog({ open: true, id: a.id, companyName: a.internship?.title || 'this company' });
                    }}
                  >
                    Rate
                  </Button>
                )}
                {a.status === 'completed' && a.studentReview?.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={a.studentReview.rating} readOnly size="small" />
                  </Box>
                )}
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}
      {applications.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          No applications yet. Browse internships to apply.
        </Typography>
      )}

      <Dialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, id: '', companyName: '' })}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>Rate your internship</DialogTitle>
        <DialogContent>
          {reviewSuccess ? (
            <Alert severity="success">{reviewSuccess}</Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                How was your experience at <strong>{reviewDialog.companyName}</strong>?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Rating
                  value={rating}
                  onChange={(_: React.SyntheticEvent, v: number | null) => setRating(v)}
                  size="large"
                />
              </Box>
              <Box
                component="textarea"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Optional comment (max 1000 chars)…"
                maxLength={1000}
                rows={4}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #ddd',
                  fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              {reviewError && <Alert severity="error" sx={{ mt: 1.5 }}>{reviewError}</Alert>}
            </>
          )}
        </DialogContent>
        {!reviewSuccess && (
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button variant="outlined" color="inherit" fullWidth onClick={() => setReviewDialog({ open: false, id: '', companyName: '' })}>
              Cancel
            </Button>
            <Button variant="contained" fullWidth onClick={handleSubmitReview} disabled={!rating || submittingReview}>
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}
