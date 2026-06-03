import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Typography,
  CardContent,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  useGetCompanyInternshipsQuery,
  useDeleteInternshipMutation,
} from '../../api/internshipApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';

export default function CompanyInternshipsPage() {
  const navigate = useNavigate();
  const { data, refetch } = useGetCompanyInternshipsQuery(undefined);
  const [deleteInternship, { isLoading: deleting }] = useDeleteInternshipMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const jobs = data?.data || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteInternship(deleteId).unwrap();
      setMessage(res.data?.message || 'Removed');
      setDeleteId(null);
      refetch();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setMessage(e?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <PageHeader
        title="My internships"
        subtitle="Edit, publish, or remove your listings."
        action={
          <Button variant="contained" component={RouterLink} to="/company/internships/new">
            Post new
          </Button>
        }
      />
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {jobs.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No internships yet. Post your first listing.
        </Typography>
      )}
      {jobs.map((job: { id: string; title: string; status: string; applicationCount?: number }, i: number) => (
        <FadeIn key={job.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 2 }}>
            <CardContent
              sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography fontWeight={600}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.applicationCount || 0} applications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <StatusChip status={job.status} />
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => navigate(`/company/internships/${job.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setDeleteId(job.id)}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </PremiumCard>
        </FadeIn>
      ))}

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete internship?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            If students have already applied, the listing will be closed instead of deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Removing...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
