import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, TextField, Button, Pagination, CircularProgress,
} from '@mui/material';
import PageHeader from '../../components/ui/PageHeader';
import { useGetAuditLogQuery } from '../../api/adminApi';

const actionColor: Record<string, 'error' | 'warning' | 'success' | 'info' | 'default'> = {
  'user.delete': 'error',
  'user.suspended': 'warning',
  'user.active': 'success',
  'user.restore': 'success',
  'company.approve': 'success',
  'company.reject': 'error',
};

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isFetching } = useGetAuditLogQuery({ page, limit: 30, ...(actionFilter ? { action: actionFilter } : {}) });
  const logs = data?.data || [];
  const total = data?.meta?.total || 0;
  const pageCount = Math.ceil(total / 30);

  return (
    <Box>
      <PageHeader title="Audit log" subtitle="All admin actions stamped with who, what, and when." />

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Filter by action"
          placeholder="e.g. user.delete"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 240 }}
        />
        <Button variant="outlined" color="inherit" size="small" onClick={() => { setActionFilter(search); setPage(1); }}>
          Apply
        </Button>
        <Button size="small" color="inherit" onClick={() => { setSearch(''); setActionFilter(''); setPage(1); }}>
          Clear
        </Button>
      </Box>

      {isFetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((l: { id: string; createdAt: string; actorEmail: string; action: string; targetEmail?: string; targetType?: string; metadata?: Record<string, unknown> }) => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{l.actorEmail}</TableCell>
                  <TableCell>
                    <Chip
                      label={l.action}
                      size="small"
                      color={actionColor[l.action] || 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{l.targetEmail || l.targetType || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.metadata ? JSON.stringify(l.metadata) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No audit log entries
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} />
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        {total} total entries
      </Typography>
    </Box>
  );
}
